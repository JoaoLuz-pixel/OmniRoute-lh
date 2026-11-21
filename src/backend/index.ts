// Server part entry (dist/backend.cjs). Plugin API v1 as in LearnHarness v0.6.1.
import type { ModelCatalogResponse, PluginBackendContext } from "learnharness-plugin-api";
import type { ChangeLogEntry, ComboSummary, PluginErrorInfo, Result, SettingsPatch, Target } from "../shared/protocol.ts";
import { COMBO_NAMES, ROLES, SLOTS } from "../shared/protocol.ts";
import { ChangeLog } from "./changelog.ts";
import { manualStepStatus, matchOmniRouteModels, noteChatModel, StateStore, takeSnapshot, targetsNeeded } from "./lh.ts";
import { asArray, asRecord, OmniRouteClient, OmniRouteError, optStr } from "./omniroute.ts";
import { redact } from "./redact.ts";
import { RuntimeManager } from "./runtime.ts";
import {
  bootstrapKeys,
  callLogs,
  createCombo,
  deleteComboGuarded,
  editableFingerprint,
  explorerGet,
  explorerSpec,
  generatePassword,
  getCombo,
  listCombos,
  listConnections,
  loginState,
  setConnectionActive,
  summarise,
  testConnection,
  updateComboGuarded,
  type ComboEdit,
} from "./services.ts";
import { applyPatch, SettingsStore, toPublic } from "./settings.ts";

const TARGETS = [...SLOTS, ...ROLES] as Target[];

function toError(error: unknown): PluginErrorInfo {
  if (error instanceof OmniRouteError) return error.toInfo();
  return { kind: "http", message: error instanceof Error ? error.message : String(error) };
}

export async function activate(ctx: PluginBackendContext) {
  const settings = new SettingsStore(ctx.dataDirectory);
  const state = new StateStore(ctx.dataDirectory);
  const changes = new ChangeLog(ctx.dataDirectory);
  const emit = (topic: string, data?: unknown) => {
    if (!ctx.signal.aborted) ctx.events.emit(topic, data);
  };
  /** Generated once and saved; passed to a plugin-started OmniRoute as INITIAL_PASSWORD. */
  const ensureDashboardPassword = () => {
    const s = settings.get();
    if (s.dashboardPassword) return s.dashboardPassword;
    const pw = generatePassword();
    settings.save({ ...s, dashboardPassword: pw });
    return pw;
  };
  const runtime = new RuntimeManager({
    ensureDashboardPassword,
    dataDirectory: ctx.dataDirectory,
    codeDirectory: ctx.directory,
    signal: ctx.signal,
    getSettings: () => settings.get(),
    emit: (line) => emit("runtime-log", { line }),
  });

  const client = (opts: { timeoutMs?: number; maxBytes?: number } = {}) => {
    const s = settings.get();
    if (!s.managementKey) throw new OmniRouteError("not-configured", "Add OmniRoute's management key in the plugin settings, or run the set-up guide.");
    return new OmniRouteClient({ baseUrl: s.baseUrl, key: s.managementKey, signal: ctx.signal, ...opts });
  };
  const owned = () => new Map(Object.entries(state.get().ownedCombos)) as Map<string, Target>;
  const catalog = async (): Promise<ModelCatalogResponse | null> => ctx.inference.catalog().catch(() => null);

  /** Every handler returns Result<T>, so the browser part always gets a plain-language error kind. */
  const handle = <I, O>(name: string, fn: (input: I) => Promise<O> | O) =>
    ctx.handle(name, async (input: unknown): Promise<Result<O>> => {
      try {
        return { ok: true, value: await fn((input ?? {}) as I) };
      } catch (error) {
        return { ok: false, error: toError(error) };
      }
    });

  // ── settings & connection ──────────────────────────────────────────────
  handle("settings.get", async () => ({ settings: toPublic(settings.get()), runtime: await runtime.status() }));
  handle("settings.save", (patch: SettingsPatch) => {
    const r = applyPatch(settings.get(), patch);
    if (!r.ok) throw new OmniRouteError("invalid-input", r.message);
    settings.save(r.settings);
    emit("settings-changed");
    return toPublic(r.settings);
  });
  handle("connection.test", async (input: { baseUrl?: string }) => {
    const s = settings.get();
    return testConnection(typeof input.baseUrl === "string" && input.baseUrl ? input.baseUrl.replace(/\/+$/, "") : s.baseUrl, s.managementKey, ctx.signal);
  });
  /** Explicit user click in the manual step: LearnHarness's Custom endpoint needs this key. */
  handle("keys.revealInference", () => {
    const k = settings.get().inferenceKey;
    if (!k) throw new OmniRouteError("not-configured", "No LearnHarness inference key is stored. Paste the one you created in OmniRoute into the settings.");
    return { key: k };
  });

  // ── managed runtime ────────────────────────────────────────────────────
  handle("runtime.status", () => runtime.status());
  handle("runtime.install", async () => {
    await runtime.install();
    return runtime.status();
  });
  handle("runtime.start", async () => {
    await runtime.start();
    return runtime.status();
  });
  handle("runtime.stop", async () => {
    await runtime.stop("stopped from the plugin");
    return runtime.status();
  });
  handle("runtime.restart", async () => {
    await runtime.stop("restart");
    await runtime.start();
    return runtime.status();
  });

  // ── set-up guide ───────────────────────────────────────────────────────
  handle("setup.state", async () => {
    const s = settings.get();
    const cat = await catalog();
    const login = await loginState(s.baseUrl, ctx.signal).catch(() => null);
    let models: string[] = [];
    let combos: ComboSummary[] = [];
    if (s.managementKey) {
      try {
        const c = client();
        combos = (await listCombos(c)).map((x) => summarise(x, owned()));
        const m = asRecord(await c.getJson("/v1/models"), "model list");
        models = asArray(m.data, "model list").flatMap((x) => (x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string" ? [(x as { id: string }).id] : []));
      } catch {
        /* guide shows the connection error separately */
      }
    }
    const st = state.get();
    const needed = cat ? targetsNeeded(cat) : [...SLOTS];
    const preferred = st.snapshotAt ? st.preferred : cat ? takeSnapshot(cat, {}) : {};
    const plans = needed.map((t) => {
      const pref = preferred[t];
      const matches = pref ? matchOmniRouteModels(pref, models).slice(0, 5) : [];
      const existing = combos.find((c) => c.name === COMBO_NAMES[t]) ?? null;
      return { target: t, comboName: COMBO_NAMES[t], preferred: pref ? `${pref.provider}/${pref.id}` : null, matches, existing };
    });
    return {
      login,
      hasManagementKey: !!s.managementKey,
      hasInferenceKey: !!s.inferenceKey,
      baseUrl: s.baseUrl,
      customEndpointUrl: `${s.baseUrl}/v1`,
      snapshotAt: st.snapshotAt,
      plans,
      models,
      manualStep: cat ? manualStepStatus(cat, st) : null,
    };
  });
  handle("setup.snapshot", async () => {
    const cat = await catalog();
    if (!cat) throw new OmniRouteError("not-configured", "LearnHarness's model catalog isn't available yet.");
    return state.update((s) => ({ ...s, preferred: takeSnapshot(cat, s.preferred), snapshotAt: new Date().toISOString() })).preferred;
  });
  handle("setup.bootstrap", async (input: { password?: string }) => {
    const s = settings.get();
    const userPassword = typeof input.password === "string" && input.password.length <= 500 ? input.password : undefined;
    const r = await bootstrapKeys(s.baseUrl, ctx.signal, {
      generatedPassword: ensureDashboardPassword(),
      storedPassword: s.dashboardPassword,
      userPassword,
      inferenceKeyName: s.inferenceKeyName || "LearnHarness",
    });
    // Only the plugin's own generated password is stored; a password the user typed is not.
    const keepPassword = r.pluginPassword ?? "";
    settings.save({ ...settings.get(), managementKey: r.managementKey, inferenceKey: r.inferenceKey, inferenceKeyName: r.inferenceKeyName, dashboardPassword: keepPassword });
    changes.add({
      action: "bootstrap",
      objectId: "omniroute",
      objectName: "First-run setup",
      before: null,
      after: { keys: [r.inferenceKeyName, "LearnHarness plugin (manage)"], password: r.replacedDefaultPassword ? "replaced the shipped default (CHANGEME)" : r.pluginPassword ? "set by the plugin" : "unchanged (yours)" },
    });
    // Shown once (decision 9). Not shown when the user's own password was used.
    return { password: r.pluginPassword, replacedDefaultPassword: r.replacedDefaultPassword };
  });
  handle("setup.createCombo", async (input: { target: Target; models: string[]; adoptExistingId?: string }) => {
    if (!TARGETS.includes(input.target)) throw new OmniRouteError("invalid-input", "Unknown target.");
    const c = client();
    const name = COMBO_NAMES[input.target];
    if (input.adoptExistingId) {
      const existing = await getCombo(c, input.adoptExistingId);
      if (existing.name !== name) throw new OmniRouteError("invalid-input", "That combo has a different name.");
      state.update((s) => ({ ...s, ownedCombos: { ...s.ownedCombos, [existing.id]: input.target } }));
      return summarise(existing, owned());
    }
    const created = await createCombo(c, name, input.models, `Managed by the OmniRoute for LearnHarness plugin (${input.target}).`);
    state.update((s) => ({ ...s, ownedCombos: { ...s.ownedCombos, [created.id]: input.target } }));
    changes.add({ action: "combo.create", objectId: created.id, objectName: created.name, before: null, after: created.raw });
    emit("routing-changed");
    return summarise(created, owned());
  });

  // ── combos & connections (writes are confirmed in the browser before calling) ──
  handle("combos.list", async () => (await listCombos(client())).map((x) => ({ ...summarise(x, owned()), fingerprint: editableFingerprint(x) })));
  handle("combos.get", async (input: { id: string }) => {
    const x = await getCombo(client(), String(input.id ?? ""));
    return { ...summarise(x, owned()), fingerprint: editableFingerprint(x), rawModels: x.models };
  });
  handle("combos.update", async (input: { id: string; fingerprint: string; edit: ComboEdit }) => {
    const { before, after } = await updateComboGuarded(client(), String(input.id), String(input.fingerprint), input.edit ?? {});
    changes.add({ action: "combo.update", objectId: after.id, objectName: after.name, before: before.raw, after: after.raw });
    emit("routing-changed");
    return summarise(after, owned());
  });
  handle("combos.delete", async (input: { id: string; fingerprint: string }) => {
    const before = await deleteComboGuarded(client(), String(input.id), String(input.fingerprint));
    state.update((s) => {
      delete s.ownedCombos[before.id];
      return s;
    });
    changes.add({ action: "combo.delete", objectId: before.id, objectName: before.name, before: before.raw, after: null });
    emit("routing-changed");
    return { deleted: before.id };
  });
  handle("connections.list", async () => listConnections(client()));
  handle("connections.toggle", async (input: { id: string; isActive: boolean }) => {
    const c = client();
    const before = (await listConnections(c)).find((x) => x.id === input.id);
    if (!before) throw new OmniRouteError("not-found", "That connection no longer exists.");
    const after = await setConnectionActive(c, before.id, input.isActive);
    changes.add({ action: "connection.toggle", objectId: after.id, objectName: `${after.provider} · ${after.name}`, before, after });
    emit("routing-changed");
    return after;
  });

  // ── data ───────────────────────────────────────────────────────────────
  handle("overview", async () => {
    const c = client({ timeoutMs: 15_000 });
    const [health, usage] = await Promise.allSettled([c.getJson("/api/monitoring/health"), c.getJson("/api/usage/history")]);
    const h = health.status === "fulfilled" ? asRecord(health.value, "health report") : null;
    return {
      version: h ? (optStr(h.version) ?? optStr((h.system as Record<string, unknown> | undefined)?.version)) : null,
      health: h ? redact(h, { maxDepth: 4, maxArray: 50 }) : null,
      healthError: health.status === "rejected" ? toError(health.reason) : null,
      usage: usage.status === "fulfilled" ? redact(usage.value, { maxDepth: 6, maxArray: 400 }) : null,
      usageError: usage.status === "rejected" ? toError(usage.reason) : null,
    };
  });
  handle("callLogs", async (input: { scope?: "lh" | "all"; limit?: number }) => {
    const s = settings.get();
    const lhOnly = input.scope !== "all";
    if (lhOnly && !s.inferenceKeyName) throw new OmniRouteError("not-configured", "Enter the name of LearnHarness's OmniRoute key in the settings to filter to LearnHarness's requests.");
    return callLogs(client(), { apiKey: lhOnly ? s.inferenceKeyName : undefined, limit: input.limit ?? 100 });
  });
  handle("explorer.spec", async () => explorerSpec(client({ timeoutMs: 15_000 })));
  handle("explorer.get", async (input: { path: string; params?: Record<string, string> }) =>
    explorerGet(client({ timeoutMs: 15_000, maxBytes: 4 * 1024 * 1024 }), String(input.path ?? ""), input.params ?? {})
  );
  handle("manual.status", async () => {
    const cat = await catalog();
    return cat ? manualStepStatus(cat, state.get()) : null;
  });

  // ── change log & revert ────────────────────────────────────────────────
  handle("changes.list", () => changes.list());
  handle("changes.revert", async (input: { id: string }) => {
    const entry = changes.get(String(input.id));
    if (!entry) throw new OmniRouteError("not-found", "Unknown change.");
    if (entry.revertedAt) throw new OmniRouteError("conflict", "This change was already reverted.");
    await revert(entry);
    changes.markReverted(entry.id);
    emit("routing-changed");
    return changes.get(entry.id);
  });

  async function revert(entry: ChangeLogEntry): Promise<void> {
    const c = client();
    const before = entry.before as Record<string, unknown> | null;
    switch (entry.action) {
      case "combo.update": {
        const current = await getCombo(c, entry.objectId);
        await updateComboGuarded(c, entry.objectId, editableFingerprint(current), {
          rawModels: Array.isArray(before?.models) && before.models.length > 0 ? (before.models as unknown[]) : undefined,
          strategy: typeof before?.strategy === "string" ? before.strategy : undefined,
          isActive: typeof before?.isActive === "boolean" ? before.isActive : undefined,
        });
        return;
      }
      case "combo.create": {
        const current = await getCombo(c, entry.objectId);
        await deleteComboGuarded(c, entry.objectId, editableFingerprint(current));
        state.update((s) => {
          delete s.ownedCombos[entry.objectId];
          return s;
        });
        return;
      }
      case "combo.delete": {
        if (!before || typeof before.name !== "string" || !Array.isArray(before.models)) throw new OmniRouteError("conflict", "Not enough data saved to restore this combo.");
        await c.request("/api/combos", { method: "POST", body: { name: before.name, models: before.models, strategy: before.strategy ?? "priority", description: before.description } });
        return;
      }
      case "connection.toggle": {
        await setConnectionActive(c, entry.objectId, (before as { isActive?: boolean } | null)?.isActive === true);
        return;
      }
      default:
        throw new OmniRouteError("invalid-input", "This change can't be reverted automatically.");
    }
  }

  // ── app events ─────────────────────────────────────────────────────────
  const off = ctx.events.on((event) => {
    if (event.type === "turn-settled") {
      try {
        noteChatModel(ctx, event.chatId, state);
      } catch {
        /* a missing chat isn't an error */
      }
      emit("turn-settled", { chatId: event.chatId });
    }
  });
  ctx.cleanup(off);

  // Manual-step watcher: v0.6.1 has no settings-changed event, so poll the catalog.
  let lastManual = "";
  const timer = setInterval(async () => {
    const cat = await catalog();
    if (!cat || ctx.signal.aborted) return;
    const status = manualStepStatus(cat, state.get());
    const key = JSON.stringify(status.pending);
    if (key !== lastManual) {
      lastManual = key;
      emit("manual-step", status);
    }
  }, 15_000);
  ctx.cleanup(() => clearInterval(timer));
  ctx.cleanup(() => runtime.onCleanup());

  // Managed mode: start OmniRoute with the app (non-blocking; activation must not hang).
  void runtime.onActivate().then(() => emit("runtime-changed"));
}
