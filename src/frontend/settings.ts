// Plugin settings page (registerSettings custom mount).
import type { PluginFrontendContext, PluginSettingsRow } from "learnharness-plugin-api";
import type { ConnectionTest, PublicSettings, RuntimeStatus, SettingsPatch } from "../shared/protocol.ts";
import { append, clear, h } from "./dom.ts";
import { openGuide } from "./guide.ts";
import type { Rpc } from "./rpc.ts";

export function mountSettings(ctx: PluginFrontendContext, rpc: Rpc, container: HTMLElement, signal: AbortSignal): void {
  const root = h("div", { class: "orl-root orl-settings" });
  container.append(root);

  const intro = h(
    "div",
    { class: "orl-callout" },
    h("strong", {}, "One manual step required. "),
    "After set-up, point LearnHarness's models at the OmniRoute-* combos in Settings → Providers → Model API keys → + Add a provider → Custom endpoint. The plugin can't change LearnHarness settings, so this is the only thing you do by hand, once. ",
    h("a", { href: "#", onclick: (e: Event) => (e.preventDefault(), openGuide(ctx, rpc)) }, "Open the set-up guide")
  );
  const rowsHost = h("div", {});
  const status = h("div", { class: "orl-status" });
  const buttons = h("div", { class: "orl-row" });
  const testOut = h("div", { class: "orl-muted", role: "status" });
  const warning = h(
    "p",
    { class: "orl-warning" },
    "Keys and the OmniRoute dashboard password are stored as plain text in this plugin's data folder. If you use a LearnHarness build with Device Sync and sync \"Plugins & their data\", they are copied to your sync endpoint."
  );
  root.append(intro, rowsHost, h("h3", {}, "OmniRoute"), status, buttons, testOut, warning);

  let settings: PublicSettings | null = null;
  let rowsHandle: ReturnType<PluginFrontendContext["ui"]["mountSettingsRows"]> | null = null;

  const save = async (patch: SettingsPatch) => {
    settings = await rpc<PublicSettings>("settings.save", patch);
    rowsHandle?.update({ rows: rows() });
  };

  const rows = (): PluginSettingsRow[] => {
    const s = settings!;
    return [
      {
        key: "mode",
        type: "dropdown",
        label: "How OmniRoute is run",
        description: "Managed: the plugin installs OmniRoute, starts it with LearnHarness and stops it when LearnHarness closes. If an OmniRoute is already running at the address, the plugin uses it and never stops it.",
        value: s.mode,
        options: [
          { value: "managed", label: "Managed by the plugin" },
          { value: "external", label: "I run OmniRoute myself" },
        ],
        onChange: (v) => save({ mode: v as PublicSettings["mode"] }),
      },
      s.mode === "managed"
        ? { key: "port", type: "number", label: "Port", value: s.port, min: 1024, max: 65535, step: 1, onChange: (v) => save({ port: v }) }
        : {
            key: "baseUrl",
            type: "text",
            label: "OmniRoute address",
            description: "For example http://127.0.0.1:20128 (without /v1).",
            value: s.baseUrl,
            validate: (v) => (/^https?:\/\/\S+$/.test(v.trim()) ? undefined : "Enter a full http:// or https:// address"),
            onChange: (v) => save({ baseUrl: v }),
          },
      {
        key: "managementKey",
        type: "text",
        label: "Management key",
        description: `Needs OmniRoute's "manage" scope; keep it separate from LearnHarness's own key. ${s.managementKeyHint ? `Stored (${s.managementKeyHint}). Paste a new one to replace it.` : "Not set."}`,
        value: "",
        onChange: (v) => (v.trim() ? save({ managementKey: v }) : undefined),
      },
      {
        key: "inferenceKeyName",
        type: "text",
        label: "Name of LearnHarness's OmniRoute key",
        description: "Used to show only LearnHarness's requests in Recent routing.",
        value: s.inferenceKeyName,
        onChange: (v) => save({ inferenceKeyName: v }),
      },
      {
        key: "inferenceKey",
        type: "text",
        label: "LearnHarness's OmniRoute key (optional)",
        description: `Only kept so the set-up guide can show it for the Custom endpoint step. ${s.inferenceKeyHint ? `Stored (${s.inferenceKeyHint}).` : "Not set."}`,
        value: "",
        onChange: (v) => (v.trim() ? save({ inferenceKey: v }) : undefined),
      },
      { key: "refresh", type: "number", label: "Refresh interval (seconds)", value: s.refreshSeconds, min: 5, max: 3600, step: 5, onChange: (v) => save({ refreshSeconds: v }) },
      {
        key: "keepRunning",
        type: "toggle",
        label: "Keep OmniRoute running after LearnHarness closes",
        description: "Turn on if other tools (Claude Code, Cursor, …) also use this OmniRoute. Takes effect the next time the plugin starts OmniRoute.",
        value: s.keepRunningAfterClose,
        disabled: s.mode !== "managed",
        onChange: (v) => save({ keepRunningAfterClose: v }),
      },
    ];
  };

  const renderStatus = (rt: RuntimeStatus) => {
    clear(status);
    clear(buttons);
    const label: Record<RuntimeStatus["state"], string> = {
      external: "Run by you (external)",
      "not-installed": "Not installed",
      installing: "Installing…",
      installed: "Installed, not running",
      starting: "Starting…",
      running: rt.ownedByPlugin ? "Running (started by the plugin)" : "Running (started outside the plugin — it won't be stopped)",
      stopping: "Stopping…",
      stopped: "Stopped",
      crashed: "Stopped unexpectedly",
    };
    append(
      status,
      h("div", {}, h("strong", {}, "Status: "), label[rt.state], rt.version ? ` · OmniRoute ${rt.version}` : "", rt.pid ? ` · PID ${rt.pid}` : ""),
      rt.installDir ? h("div", { class: "orl-muted" }, `Installed in ${rt.installDir}`) : null,
      rt.nodePath ? h("div", { class: "orl-muted" }, `Node: ${rt.nodePath}`) : null,
      rt.lastError ? h("pre", { class: "orl-error" }, rt.lastError) : null
    );
    const btn = (label: string, op: string, variant: "default" | "outline" = "outline") => {
      const slot = h("span", {});
      buttons.append(slot);
      ctx.ui.mountButton(
        slot,
        {
          label,
          variant,
          size: "sm",
          onClick: async () => {
            renderStatus(await rpc<RuntimeStatus>(op));
          },
        },
        { signal }
      );
    };
    const test = h("span", {});
    buttons.append(test);
    ctx.ui.mountButton(
      test,
      {
        label: "Test connection",
        size: "sm",
        onClick: async () => {
          testOut.textContent = "Testing…";
          const r = await rpc<ConnectionTest>("connection.test");
          testOut.textContent = r.detail;
        },
      },
      { signal }
    );
    if (rt.mode === "managed") {
      if (rt.state === "not-installed") {
        const g = h("span", {});
        buttons.append(g);
        ctx.ui.mountButton(g, { label: "Install OmniRoute…", onClick: () => openGuide(ctx, rpc) }, { signal });
      }
      if (["installed", "stopped", "crashed"].includes(rt.state)) btn("Start", "runtime.start", "default");
      if (rt.state === "running" && rt.ownedByPlugin) {
        btn("Restart", "runtime.restart");
        btn("Stop", "runtime.stop");
      }
    }
  };

  void (async () => {
    const r = await rpc<{ settings: PublicSettings; runtime: RuntimeStatus }>("settings.get");
    if (signal.aborted) return;
    settings = r.settings;
    rowsHandle = ctx.ui.mountSettingsRows(rowsHost, { rows: rows() }, { signal });
    renderStatus(r.runtime);
  })().catch((e: Error) => root.append(h("pre", { class: "orl-error" }, e.message)));

  const off = ctx.onNotification((n) => {
    if (n.topic === "runtime-changed" || n.topic === "settings-changed")
      void rpc<RuntimeStatus>("runtime.status")
        .then(renderStatus)
        .catch(() => undefined);
    if (n.topic === "runtime-log" && n.data && typeof (n.data as { line?: unknown }).line === "string") testOut.textContent = (n.data as { line: string }).line;
  });
  signal.addEventListener("abort", off, { once: true });
}
