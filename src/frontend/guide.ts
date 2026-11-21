// "Set up OmniRoute" guide (page-body surface). BRIEF 4.2, 4.6 (disclosure), 4.8.
import type { PluginFrontendContext } from "learnharness-plugin-api";
import type { ComboSummary, ManualStepStatus, RuntimeStatus, Target } from "../shared/protocol.ts";
import { clear, h } from "./dom.ts";
import { confirmDialog } from "./confirm.ts";
import type { Rpc } from "./rpc.ts";

interface Plan {
  target: Target;
  comboName: string;
  preferred: string | null;
  matches: { id: string; exact: boolean }[];
  existing: ComboSummary | null;
}
interface SetupState {
  login: { bootstrapWindow: boolean; hasPassword: boolean } | null;
  hasManagementKey: boolean;
  hasInferenceKey: boolean;
  connections: { provider: string; name: string; isActive: boolean }[];
  baseUrl: string;
  customEndpointUrl: string;
  snapshotAt: string | null;
  plans: Plan[];
  models: string[];
  manualStep: ManualStepStatus | null;
}

const TARGET_LABEL: Record<Target, string> = {
  strong: "Strong model",
  cheap: "Cheap model",
  vision: "Vision model",
  researcher: "Researcher (role override)",
  demoBuilder: "Demo builder (role override)",
  visualMaker: "Visual maker (role override)",
  extractor: "Extractor (role override)",
  auditor: "Auditor (role override)",
  sideQuestion: "Side questions (role override)",
};

let open: { dispose(): void } | null = null;

export function openGuide(ctx: PluginFrontendContext, rpc: Rpc): void {
  open?.dispose();
  const ac = new AbortController();
  const handle = ctx.ui.openSurface(
    {
      title: "Set up OmniRoute",
      background: "opaque",
      content: (container, signal) => {
        signal.addEventListener("abort", () => ac.abort(), { once: true });
        renderGuide(ctx, rpc, container, signal);
      },
      onClose: () => {
        open = null;
      },
    },
    { signal: ctx.signal }
  );
  open = handle;
}

function copyButton(ctx: PluginFrontendContext, host: HTMLElement, getText: () => Promise<string> | string, signal: AbortSignal, label = "Copy"): void {
  const slot = h("span", { class: "orl-copy" });
  host.append(slot);
  const b = ctx.ui.mountButton(
    slot,
    {
      label,
      size: "xs",
      variant: "outline",
      onClick: async () => {
        await navigator.clipboard.writeText(await getText());
        b.update({ label: "Copied" });
        setTimeout(() => b.update({ label }), 1500);
      },
    },
    { signal }
  );
}

function renderGuide(ctx: PluginFrontendContext, rpc: Rpc, container: HTMLElement, signal: AbortSignal): void {
  const root = h("div", { class: "orl-root orl-guide" });
  container.append(root);
  const log = h("pre", { class: "orl-log", "aria-live": "polite" });
  const offLog = ctx.onNotification((n) => {
    if (n.topic === "runtime-log" && n.data && typeof (n.data as { line?: unknown }).line === "string") {
      log.textContent = (log.textContent + "\n" + (n.data as { line: string }).line).split("\n").slice(-200).join("\n");
      log.scrollTop = log.scrollHeight;
    }
    if (n.topic === "manual-step") void render();
  });
  signal.addEventListener("abort", offLog, { once: true });

  const section = (n: number, title: string, ...body: (Node | null)[]) => h("section", { class: "orl-step" }, h("h3", {}, `${n}. ${title}`), ...body);
  const button = (host: HTMLElement, label: string, onClick: () => Promise<void> | void, variant: "default" | "outline" = "default") => {
    const slot = h("span", {});
    host.append(slot);
    ctx.ui.mountButton(slot, { label, onClick, variant, size: "sm" }, { signal });
  };

  // Shown once after first-run set-up; kept on screen until the guide closes.
  let revealedPassword: string | null = null;

  async function render(): Promise<void> {
    const [runtime, state] = await Promise.all([rpc<RuntimeStatus>("runtime.status"), rpc<SetupState>("setup.state")]);
    if (signal.aborted) return;
    clear(root);
    root.append(
      h("h2", { "data-plugin-initial-focus": true, tabindex: -1 }, "Set up OmniRoute for LearnHarness"),
      h(
        "p",
        { class: "orl-callout" },
        h("strong", {}, "Heads-up: one step is manual. "),
        "The plugin can install and run OmniRoute, create its keys and build the routing combos, but it cannot change LearnHarness's own model settings. In step 6 you point LearnHarness at the combos yourself, once. Until then routing isn't active."
      )
    );
    if (revealedPassword) {
      const pw = revealedPassword;
      const shown = h("div", { class: "orl-secret" }, h("p", {}, "OmniRoute dashboard password (sign in at " + state.baseUrl + "/dashboard) — save it in your password manager now. It won't be shown again after you close this guide."), h("code", {}, pw));
      copyButton(ctx, shown, () => pw, signal);
      root.append(shown);
    }

    // 1. OmniRoute running
    const s1 = h("div", { class: "orl-row" });
    const stateText: Record<string, string> = {
      external: "You run OmniRoute yourself.",
      "not-installed": "OmniRoute isn't installed. The plugin can install it into its own folder (outside LearnHarness's data). It needs Node.js 22.22.2+ or 24–26 and takes a few minutes.",
      installed: "Installed but not running.",
      stopped: "Installed but not running.",
      crashed: "OmniRoute stopped unexpectedly. See the log below.",
      starting: "Starting…",
      installing: "Installing…",
      running: `Running${runtime.version ? ` (${runtime.version})` : ""}.`,
      stopping: "Stopping…",
    };
    if (runtime.state === "not-installed")
      button(s1, "Install OmniRoute", async () => {
        if (!(await confirmDialog(ctx, { title: "Install OmniRoute?", body: ["The plugin will run npm to install the latest omniroute package into its own folder, allowing the install scripts OmniRoute needs (native SQLite/TLS modules).", "Nothing in LearnHarness's data is changed."], confirm: "Install" }))) return;
        await rpc("runtime.install");
        await rpc("runtime.start");
        await render();
      });
    if (["installed", "stopped", "crashed"].includes(runtime.state) && runtime.mode === "managed")
      button(s1, "Start OmniRoute", async () => {
        await rpc("runtime.start");
        await render();
      });
    root.append(section(1, "Run OmniRoute", h("p", {}, stateText[runtime.state] ?? runtime.state), s1, runtime.lastError ? h("pre", { class: "orl-error" }, runtime.lastError) : null, log));
    if (runtime.state !== "running" && runtime.state !== "external") return;

    // 2. Keys
    const s2 = h("div", {});
    if (state.hasManagementKey) s2.append(h("p", {}, "✓ The plugin has a management key."));
    else {
      s2.append(
        h("p", {}, 'The plugin creates two OmniRoute keys: "LearnHarness" (for LearnHarness\'s Custom endpoint) and "LearnHarness plugin (manage)" (for itself). It signs in to OmniRoute\'s dashboard once to do that.'),
        h("p", { class: "orl-muted" }, "If OmniRoute still has its shipped default password (CHANGEME) or none at all, the plugin replaces it with a strong random one and shows it to you once.")
      );
      const pw = h("input", { class: "orl-input", type: "password", autocomplete: "off", placeholder: "Only if you set your own OmniRoute dashboard password", "aria-label": "OmniRoute dashboard password (optional)" }) as HTMLInputElement;
      const err = h("p", { class: "orl-error", role: "alert" });
      const row = h("div", { class: "orl-row" });
      s2.append(h("label", { class: "orl-label" }, "Your OmniRoute dashboard password (optional, not stored):", pw), row, err);
      button(row, "Set up OmniRoute for me", async () => {
        if (!(await confirmDialog(ctx, { title: "Create the keys in OmniRoute?", body: ['Creates two keys: "LearnHarness" and "LearnHarness plugin (manage)".', "Replaces OmniRoute's dashboard password only if it is the shipped default (CHANGEME) or missing; the new one is shown once.", "This is the only time the plugin creates keys."], confirm: "Set up" }))) return;
        err.textContent = "";
        try {
          const r = await rpc<{ password: string | null; replacedDefaultPassword: boolean }>("setup.bootstrap", { password: pw.value || undefined });
          pw.value = "";
          if (r.password) revealedPassword = r.password;
          await render();
        } catch (e) {
          err.textContent = (e as Error).message;
        }
      });
      s2.append(h("p", { class: "orl-muted" }, "Prefer to do it yourself? Create the two keys in OmniRoute's dashboard and paste them in the ", h("a", { href: "#", onclick: (e: Event) => (e.preventDefault(), ctx.app.openSettings()) }, "plugin settings"), "."));
    }
    root.append(section(2, "Keys", s2));
    if (!state.hasManagementKey) return;

    // 3. AI accounts inside OmniRoute (the plugin can't copy LearnHarness's logins)
    const s3a = h("div", {});
    const dash = `${state.baseUrl}/dashboard`;
    const active = state.connections.filter((c) => c.isActive);
    s3a.append(
      h("p", {}, "OmniRoute needs its own connections to your AI accounts. Those you use in LearnHarness (for example Claude Code or GitHub Copilot) have to be connected in OmniRoute too: the plugin can't copy LearnHarness's logins."),
      active.length
        ? h("p", { class: "orl-ok" }, `✓ ${active.length} connected: ${active.map((c) => `${c.provider} · ${c.name}`).slice(0, 6).join(", ")}`)
        : h("p", { class: "orl-warning" }, "No accounts are connected in OmniRoute yet, so the combos have nothing to route to."),
      h("p", {}, "Open OmniRoute's dashboard → Providers, connect your accounts, then come back and click “Check again”: ", h("a", { href: dash, target: "_blank", rel: "noopener noreferrer" }, dash))
    );
    const r3a = h("div", { class: "orl-row" });
    s3a.append(r3a);
    copyButton(ctx, r3a, () => dash, signal, "Copy dashboard address");
    button(r3a, "Check again", () => render(), "outline");
    root.append(section(3, "Connect your AI accounts in OmniRoute", s3a));

    // 4. Snapshot of the user's models
    const s3 = h("div", {});
    s3.append(h("p", {}, "The plugin keeps a copy of the models you use in LearnHarness now, so they stay first in your routing after you switch to OmniRoute."));
    const t = h("table", { class: "orl-table" }, h("thead", {}, h("tr", {}, h("th", {}, "LearnHarness"), h("th", {}, "Your model"), h("th", {}, "Combo"))));
    const tb = h("tbody", {});
    for (const p of state.plans) tb.append(h("tr", {}, h("td", {}, TARGET_LABEL[p.target]), h("td", {}, p.preferred ?? "–"), h("td", {}, p.comboName)));
    t.append(tb);
    s3.append(t);
    const r3 = h("div", { class: "orl-row" });
    s3.append(r3, h("p", { class: "orl-muted" }, state.snapshotAt ? `Saved ${new Date(state.snapshotAt).toLocaleString()}.` : "Not saved yet."));
    button(r3, state.snapshotAt ? "Update from LearnHarness" : "Save my models", async () => {
      await rpc("setup.snapshot");
      await render();
    }, state.snapshotAt ? "outline" : "default");
    root.append(section(4, "Your current models", s3));

    // 5. Combos
    const s4 = h("div", {});
    for (const p of state.plans) {
      const card = h("div", { class: "orl-card" }, h("h4", {}, `${p.comboName} — ${TARGET_LABEL[p.target]}`));
      if (p.existing?.ownedByPlugin) {
        card.append(h("p", {}, `✓ Exists: ${p.existing.models.join(" → ")} (${p.existing.strategy})`));
      } else if (p.existing) {
        card.append(h("p", {}, `A combo named ${p.comboName} already exists in OmniRoute but wasn't created by this plugin: ${p.existing.models.join(" → ")}.`));
        const row = h("div", { class: "orl-row" });
        card.append(row);
        button(row, "Use it", async () => {
          await rpc("setup.createCombo", { target: p.target, models: [], adoptExistingId: p.existing!.id });
          await render();
        });
      } else {
        const suggestion = p.matches.map((m) => m.id);
        const input = h("input", { class: "orl-input", value: suggestion.slice(0, 1).join(", "), placeholder: "provider/model, provider/model, …", "aria-label": `Models for ${p.comboName}` }) as HTMLInputElement;
        card.append(
          h("p", {}, p.preferred ? `Your model: ${p.preferred}. ${suggestion.length ? `Matches in OmniRoute: ${suggestion.join(", ")}.` : "No match in OmniRoute yet — connect that provider in OmniRoute, or pick another model."}` : "No model set in LearnHarness for this one."),
          h("label", { class: "orl-label" }, "Models, in order (first = always tried first):", input),
          h("datalist", { id: `orl-models-${p.target}` }, ...state.models.slice(0, 500).map((m) => h("option", { value: m })))
        );
        input.setAttribute("list", `orl-models-${p.target}`);
        const row = h("div", { class: "orl-row" });
        card.append(row);
        button(row, "Create combo", async () => {
          const models = input.value.split(",").map((x) => x.trim()).filter(Boolean);
          if (!models.length) return;
          if (!(await confirmDialog(ctx, { title: `Create ${p.comboName}?`, body: [`Strategy: priority (the first model is always tried first).`, `Models: ${models.join(" → ")}`], confirm: "Create" }))) return;
          await rpc("setup.createCombo", { target: p.target, models });
          await render();
        });
      }
      s4.append(card);
    }
    root.append(section(5, "Routing combos", s4));
    const allReady = state.plans.every((p) => p.existing);
    if (!allReady) return;

    // 6. The one manual step
    const s5 = h("div", {});
    const urlRow = h("div", { class: "orl-row" }, h("span", {}, "Base URL: "), h("code", {}, state.customEndpointUrl));
    copyButton(ctx, urlRow, () => state.customEndpointUrl, signal);
    const keyRow = h("div", { class: "orl-row" }, h("span", {}, "API key: "), h("code", {}, state.hasInferenceKey ? "LearnHarness key (hidden)" : "the key you created for LearnHarness"));
    if (state.hasInferenceKey) copyButton(ctx, keyRow, async () => (await rpc<{ key: string }>("keys.revealInference")).key, signal, "Copy key");
    const picks = h("ul", {}, ...state.plans.map((p) => h("li", {}, `${TARGET_LABEL[p.target]} → `, h("code", {}, p.comboName))));
    s5.append(
      h("p", {}, h("strong", {}, "Do this in LearnHarness: "), "Settings → Providers → Custom endpoint."),
      h("ol", {}, h("li", {}, urlRow, h("span", { class: "orl-muted" }, "LearnHarness doesn't add /v1 itself — keep it.")), h("li", {}, "Mode: API key."), h("li", {}, keyRow), h("li", {}, h("strong", {}, "Click Connect"), " — also if it's already connected. LearnHarness reads OmniRoute's model list only when you click Connect, so combos created later don't show up until you do."), h("li", {}, "Set the models:", picks)),
      (() => {
        const ids = state.plans.map((p) => p.comboName).join(", ");
        const row = h("div", { class: "orl-row" }, h("span", { class: "orl-muted" }, "Still not in the model list? Add them in the Custom endpoint's manual model IDs field: "), h("code", {}, ids));
        copyButton(ctx, row, () => ids, signal);
        return row;
      })(),
      h("p", { class: "orl-muted" }, "Chats that already chose their own model keep it. The OmniRoute screen lists them after their next reply.")
    );
    const check = state.manualStep;
    const s5status = check?.complete
      ? h("p", { class: "orl-ok" }, "✓ Done — LearnHarness now routes through OmniRoute.")
      : h("div", { class: "orl-warning" }, h("p", {}, "Not done yet. Still to change:"), h("ul", {}, ...(check?.pending ?? []).map((p) => h("li", {}, `${TARGET_LABEL[p.target]}: now ${p.current ?? "unset"} → set to ${p.expected}`))));
    root.append(section(6, "The one manual step (in LearnHarness)", s5, s5status));
    const done = h("div", { class: "orl-row" });
    root.append(done);
    button(done, "Check again", () => render(), "outline");
    button(done, "Open the OmniRoute screen", () => ctx.app.openView("omniroute"));
  }

  void render().catch((e: Error) => root.append(h("pre", { class: "orl-error" }, e.message)));
}
