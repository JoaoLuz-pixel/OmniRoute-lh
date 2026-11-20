// LearnHarness side: read the host catalog (v0.6.1 ctx.inference.catalog), check the
// one manual step, keep the user's preferred-models snapshot, match models to OmniRoute.
import * as path from "node:path";
import type { ModelCatalogResponse, PluginBackendContext } from "learnharness-plugin-api";
import { COMBO_NAMES, LH_CUSTOM_PROVIDER, ROLES, SLOTS, type ManualStepStatus, type Target } from "../shared/protocol.ts";
import { readVersioned, writeJsonAtomic } from "./store.ts";

export interface ModelRef {
  provider: string;
  id: string;
}

export interface PluginState {
  version: 1;
  /** Combo id → target, for combos this plugin created or adopted (ownership by id, decision 5b). */
  ownedCombos: Record<string, Target>;
  /** The user's models before switching to OmniRoute (BRIEF 4.6 step 1). */
  preferred: Partial<Record<Target, ModelRef>>;
  snapshotAt: string | null;
  /** chatId → model, for chats that set their own model outside the OmniRoute combos. */
  bypassingChats: Record<string, string>;
}

const STATE_VERSION = 1;
const emptyState = (): PluginState => ({ version: 1, ownedCombos: {}, preferred: {}, snapshotAt: null, bypassingChats: {} });

export class StateStore {
  private readonly file: string;
  private cached: PluginState | null = null;
  constructor(dataDirectory: string) {
    this.file = path.join(dataDirectory, "state.json");
  }
  get(): PluginState {
    if (!this.cached) {
      this.cached = readVersioned(this.file, STATE_VERSION, emptyState, (raw) => ({
        ...emptyState(),
        ownedCombos: (raw.ownedCombos as PluginState["ownedCombos"]) ?? {},
        preferred: (raw.preferred as PluginState["preferred"]) ?? {},
        snapshotAt: typeof raw.snapshotAt === "string" ? raw.snapshotAt : null,
        bypassingChats: (raw.bypassingChats as PluginState["bypassingChats"]) ?? {},
      }));
    }
    return this.cached;
  }
  update(fn: (s: PluginState) => PluginState): PluginState {
    const next = fn(structuredClone(this.get()));
    writeJsonAtomic(this.file, next);
    this.cached = next;
    return next;
  }
}

const isPluginCombo = (m: ModelRef | null | undefined, target: Target) => !!m && m.provider === LH_CUSTOM_PROVIDER && m.id === COMBO_NAMES[target];
const isAnyPluginCombo = (m: ModelRef | null | undefined) => !!m && m.provider === LH_CUSTOM_PROVIDER && Object.values(COMBO_NAMES).includes(m.id);

/** Models LearnHarness currently resolves per slot and per role. */
export function currentAssignments(catalog: ModelCatalogResponse): Partial<Record<Target, ModelRef | null>> {
  const out: Partial<Record<Target, ModelRef | null>> = {};
  for (const slot of SLOTS) out[slot] = catalog.slots[slot]?.model ?? null;
  for (const role of ROLES) {
    const pin = (catalog.rolePins as Record<string, { model: ModelRef } | null>)[role];
    out[role] = pin?.model ?? null;
  }
  return out;
}

/** Roles that differ from the slot they'd otherwise use get their own combo (decision 6b default). */
export function targetsNeeded(catalog: ModelCatalogResponse): Target[] {
  const a = currentAssignments(catalog);
  const slotIds = new Set(SLOTS.map((s) => (a[s] ? `${a[s]!.provider}/${a[s]!.id}` : "")));
  const roles = ROLES.filter((r) => {
    const m = a[r];
    if (!m) return false;
    if (isAnyPluginCombo(m) && !isPluginCombo(m, r)) return false; // points at a slot combo: fine
    return !slotIds.has(`${m.provider}/${m.id}`) || isPluginCombo(m, r);
  });
  return [...SLOTS.filter((s) => a[s] !== null), ...roles];
}

/** One-manual-step check: every configured target resolves to its plugin combo via Custom endpoint. */
export function manualStepStatus(catalog: ModelCatalogResponse, state: PluginState): ManualStepStatus {
  const a = currentAssignments(catalog);
  const pending: ManualStepStatus["pending"] = [];
  for (const t of targetsNeeded(catalog)) {
    const m = a[t] ?? null;
    const ok = SLOTS.includes(t as (typeof SLOTS)[number]) ? isPluginCombo(m, t) : isAnyPluginCombo(m);
    if (!ok) pending.push({ target: t, current: m ? `${m.provider}/${m.id}` : null, expected: `${LH_CUSTOM_PROVIDER}/${COMBO_NAMES[t]}` });
  }
  const bypassingChats = Object.entries(state.bypassingChats).map(([chatId, model]) => ({ chatId, model }));
  return { complete: pending.length === 0 && targetsNeeded(catalog).length > 0, pending, bypassingChats };
}

/** Snapshot preferred models — only models that aren't already plugin combos. */
export function takeSnapshot(catalog: ModelCatalogResponse, previous: PluginState["preferred"]): PluginState["preferred"] {
  const a = currentAssignments(catalog);
  const out: PluginState["preferred"] = { ...previous };
  for (const [t, m] of Object.entries(a) as [Target, ModelRef | null][]) if (m && !isAnyPluginCombo(m)) out[t] = m;
  return out;
}

/** Candidate OmniRoute model ids for a LearnHarness model, best first. */
export function matchOmniRouteModels(lh: ModelRef, omnirouteModelIds: string[]): { id: string; exact: boolean }[] {
  const id = lh.id.toLowerCase().replace(/^.*\//, "");
  const base = id.replace(/-\d{8}$/, "").replace(/-(latest|preview)$/, "");
  const scored: { id: string; exact: boolean; score: number }[] = [];
  for (const om of omnirouteModelIds) {
    const tail = om.toLowerCase().replace(/^.*\//, "");
    if (tail === id) scored.push({ id: om, exact: true, score: om.toLowerCase().startsWith(lh.provider.toLowerCase()) ? 3 : 2 });
    else if (tail.replace(/-\d{8}$/, "") === base) scored.push({ id: om, exact: false, score: 1 });
  }
  return scored.sort((a, b) => b.score - a.score).map(({ id: i, exact }) => ({ id: i, exact }));
}

/** Track chats whose own model bypasses the combos (read on turn-settled; v0.6.1 getSession). */
export function noteChatModel(ctx: PluginBackendContext, chatId: string, state: StateStore): void {
  const record = ctx.learning.getSession(chatId);
  const m = record?.settings?.model;
  state.update((s) => {
    if (m && !isAnyPluginCombo(m)) s.bypassingChats[chatId] = `${m.provider}/${m.id}`;
    else delete s.bypassingChats[chatId];
    return s;
  });
}
