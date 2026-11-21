// The OmniRoute screen (registerView "omniroute"). First-release tabs (decision 3).
import type { PluginFrontendContext } from "learnharness-plugin-api";
import type { CallLogRow, ChangeLogEntry, ComboSummary, ExplorerEndpoint, ManualStepStatus, PublicSettings, RuntimeStatus } from "../shared/protocol.ts";
import { append, autoTable, barChart, clear, fmt, h, jsonTree } from "./dom.ts";
import { confirmDialog } from "./confirm.ts";
import { openGuide } from "./guide.ts";
import { RpcError, type Rpc } from "./rpc.ts";

type Tab = "routing" | "overview" | "recent" | "explorer" | "changes";
const TABS: [Tab, string][] = [
  ["routing", "Routing"],
  ["overview", "Overview"],
  ["recent", "Recent routing"],
  ["explorer", "Explorer"],
  ["changes", "Change log"],
];
const STRATEGIES = ["priority", "weighted", "round-robin", "fill-first", "p2c", "random", "least-used", "cost-optimized", "quota-weighted", "headroom", "reset-aware", "lkgp", "auto", "context-optimized", "cache-optimized"];

let lastTab: Tab = "routing";

export function mountView(ctx: PluginFrontendContext, rpc: Rpc, container: HTMLElement, signal: AbortSignal): () => void {
  const root = h("div", { class: "orl-root orl-view" });
  const banner = h("div", { role: "status" });
  const tabs = h("div", { class: "orl-tabs", role: "tablist" });
  const body = h("div", { class: "orl-body" });
  root.append(banner, tabs, body);
  container.append(root);

  let tab: Tab = lastTab;
  let renderGen = 0;
  const showError = (host: HTMLElement, e: unknown) => {
    const info = e instanceof RpcError ? e.info : { kind: "http", message: String((e as Error)?.message ?? e) };
    host.append(
      h(
        "div",
        { class: "orl-error" },
        info.message,
        info.kind === "not-configured" || info.kind === "unauthorized" || info.kind === "forbidden"
          ? h("div", {}, h("a", { href: "#", onclick: (ev: Event) => (ev.preventDefault(), openGuide(ctx, rpc)) }, "Open the set-up guide"))
          : null
      )
    );
  };

  const renderTabs = () => {
    clear(tabs);
    for (const [id, label] of TABS)
      tabs.append(
        h(
          "button",
          {
            class: `orl-tab${id === tab ? " orl-tab-on" : ""}`,
            role: "tab",
            "aria-selected": id === tab ? "true" : "false",
            onclick: () => {
              tab = lastTab = id;
              renderTabs();
              void renderBody();
            },
          },
          label
        )
      );
  };

  async function renderBanner(): Promise<void> {
    clear(banner);
    try {
      const [manual, rt] = await Promise.all([rpc<ManualStepStatus | null>("manual.status"), rpc<RuntimeStatus>("runtime.status")]);
      if (rt.state !== "running" && rt.state !== "external") {
        banner.append(h("div", { class: "orl-banner orl-banner-warn" }, `OmniRoute is ${rt.state.replace("-", " ")}. `, link("Open the set-up guide")));
      } else if (manual && !manual.complete) {
        const list = manual.pending.map((p) => `${p.target}: ${p.current ?? "unset"}`).join(", ");
        banner.append(
          h(
            "div",
            { class: "orl-banner orl-banner-warn" },
            h("strong", {}, "Routing is not active yet. "),
            `LearnHarness still uses ${list || "its own models"}. Complete the one manual step: in Settings → Providers → Model API keys → + Add a provider → Custom endpoint, click Connect (again if needed, so the OmniRoute-* combos appear), then pick them as your models. `,
            link("Show me how")
          )
        );
      }
      if (manual?.bypassingChats.length)
        banner.append(h("div", { class: "orl-banner" }, `${manual.bypassingChats.length} chat(s) use their own model and skip OmniRoute: `, manual.bypassingChats.slice(0, 5).map((c) => c.model).join(", ")));
    } catch {
      /* the body shows connection errors */
    }
  }
  const link = (text: string) => h("a", { href: "#", onclick: (e: Event) => (e.preventDefault(), openGuide(ctx, rpc)) }, text);

  async function renderBody(): Promise<void> {
    const gen = ++renderGen;
    const target = h("div", {});
    try {
      if (tab === "routing") await routingTab(target);
      else if (tab === "overview") await overviewTab(target);
      else if (tab === "recent") await recentTab(target);
      else if (tab === "explorer") await explorerTab(target);
      else await changesTab(target);
    } catch (e) {
      showError(target, e);
    }
    if (gen !== renderGen || signal.aborted) return;
    clear(body);
    body.append(target);
  }

  // ── Routing ────────────────────────────────────────────────────────────
  async function routingTab(host: HTMLElement): Promise<void> {
    const combos = await rpc<(ComboSummary & { fingerprint: string })[]>("combos.list");
    const mine = combos.filter((c) => c.ownedByPlugin);
    const others = combos.filter((c) => !c.ownedByPlugin);
    host.append(h("h3", {}, "LearnHarness routing"));
    if (!mine.length) host.append(h("p", {}, "No OmniRoute-* combos yet. ", link("Create them in the set-up guide")));
    for (const c of mine) host.append(comboCard(c, true));
    host.append(h("h3", {}, "Other combos in OmniRoute"), h("p", { class: "orl-muted" }, "Other tools may use these. Changes ask for an extra confirmation."));
    for (const c of others) host.append(comboCard(c, false));
    const conns = h("div", {});
    host.append(h("h3", {}, "Provider connections"), h("p", { class: "orl-muted" }, "Shared by every OmniRoute client. Turning one off stops all routing through it."), conns);
    try {
      const list = await rpc<{ id: string; provider: string; name: string; isActive: boolean; testStatus: string | null; lastError: string | null; rateLimitedUntil: string | null }[]>("connections.list");
      if (!list.some((c) => c.isActive)) {
        const dash = `${(await rpc<{ settings: PublicSettings }>("settings.get")).settings.baseUrl}/dashboard`;
        conns.append(h("p", { class: "orl-warning" }, "No AI accounts are connected in OmniRoute, so the combos above can't reach any model. Connect your accounts in OmniRoute's dashboard (Providers): ", h("a", { href: dash, target: "_blank", rel: "noopener noreferrer" }, dash)));
      }
      for (const c of list) {
        const row = h("div", { class: "orl-conn" }, h("span", { class: c.isActive ? "orl-dot-on" : "orl-dot-off" }, "●"), h("span", {}, `${c.provider} · ${c.name}`));
        if (c.rateLimitedUntil) row.append(h("span", { class: "orl-muted" }, ` rate-limited until ${fmt.time(c.rateLimitedUntil)}`));
        if (c.lastError) row.append(h("span", { class: "orl-muted", title: c.lastError }, " last error"));
        const slot = h("span", { class: "orl-push" });
        row.append(slot);
        ctx.ui.mountButton(
          slot,
          {
            label: c.isActive ? "Turn off" : "Turn on",
            size: "xs",
            variant: "outline",
            onClick: async () => {
              const ok = await confirmDialog(ctx, {
                title: `${c.isActive ? "Turn off" : "Turn on"} ${c.provider} · ${c.name}?`,
                body: [`OmniRoute will ${c.isActive ? "stop" : "start"} routing requests through this connection.`],
                diff: [{ label: "Active", before: String(c.isActive), after: String(!c.isActive) }],
                warning: "This connection is shared by every client of this OmniRoute (Claude Code, Cursor, …), not just LearnHarness.",
                confirm: c.isActive ? "Turn off" : "Turn on",
                destructive: c.isActive,
              });
              if (!ok) return;
              await rpc("connections.toggle", { id: c.id, isActive: !c.isActive });
              await renderBody();
            },
          },
          { signal }
        );
        conns.append(row);
      }
    } catch (e) {
      showError(conns, e);
    }
  }

  function comboCard(c: ComboSummary & { fingerprint: string }, mine: boolean): HTMLElement {
    const card = h("div", { class: `orl-card${c.isActive ? "" : " orl-inactive"}` });
    card.append(h("div", { class: "orl-row" }, h("strong", {}, c.name), h("span", { class: "orl-chip" }, c.strategy), c.isActive ? null : h("span", { class: "orl-chip" }, "inactive"), c.target ? h("span", { class: "orl-chip" }, `LearnHarness ${c.target}`) : null));
    card.append(h("ol", { class: "orl-chain" }, ...c.models.map((m, i) => h("li", {}, m, i === 0 && mine ? h("span", { class: "orl-muted" }, " (always tried first)") : null))));
    const row = h("div", { class: "orl-row" });
    card.append(row);
    const edit = h("span", {});
    const del = h("span", {});
    row.append(edit, del);
    ctx.ui.mountButton(edit, { label: "Edit", size: "xs", variant: "outline", onClick: () => editCombo(c, mine) }, { signal });
    ctx.ui.mountButton(
      del,
      {
        label: "Delete",
        size: "xs",
        variant: "ghost",
        onClick: async () => {
          const ok = await confirmDialog(ctx, {
            title: `Delete ${c.name}?`,
            body: [`Models: ${c.models.join(" → ")}`, "You can restore it from the Change log."],
            warning: mine ? "LearnHarness is set to use this combo. Requests to it will fail until you recreate it or change LearnHarness's model." : "Other OmniRoute clients may use this combo.",
            confirm: "Delete",
            destructive: true,
          });
          if (!ok) return;
          await rpc("combos.delete", { id: c.id, fingerprint: c.fingerprint });
          await renderBody();
        },
      },
      { signal }
    );
    return card;
  }

  async function editCombo(c: ComboSummary & { fingerprint: string }, mine: boolean): Promise<void> {
    const models = [...c.models];
    let strategy = c.strategy;
    let isActive = c.isActive;
    await new Promise<void>((resolve) => {
      const dlg = ctx.ui.openDialog(
        {
          title: `Edit ${c.name}`,
          onClose: () => resolve(),
          content: (container, sig) => {
            const root2 = h("div", { class: "orl-root orl-edit" }, h("h3", {}, `Edit ${c.name}`));
            const list = h("ol", { class: "orl-chain" });
            const redraw = () => {
              clear(list);
              models.forEach((m, i) => {
                const li = h("li", { class: "orl-edit-row" }, h("span", {}, m));
                const mk = (label: string, fn: () => void, disabled = false) => li.append(h("button", { class: "orl-mini", type: "button", "aria-label": `${label} ${m}`, disabled, onclick: () => (fn(), redraw()) }, label));
                mk("↑", () => models.splice(i - 1, 0, ...models.splice(i, 1)), i === 0);
                mk("↓", () => models.splice(i + 1, 0, ...models.splice(i, 1)), i === models.length - 1);
                mk("✕", () => models.splice(i, 1), models.length === 1);
                list.append(li);
              });
            };
            redraw();
            const add = h("input", { class: "orl-input", placeholder: "Add a model: provider/model", "aria-label": "Add a model" }) as HTMLInputElement;
            add.addEventListener("keydown", (e) => {
              if ((e as KeyboardEvent).key === "Enter" && add.value.trim()) {
                models.push(add.value.trim());
                add.value = "";
                redraw();
              }
            });
            const sel = h("select", { class: "orl-input", "aria-label": "Strategy" }, ...[...new Set([strategy, ...STRATEGIES])].map((s) => h("option", { value: s, selected: s === strategy }, s))) as HTMLSelectElement;
            sel.addEventListener("change", () => (strategy = sel.value));
            const active = h("input", { type: "checkbox", checked: isActive }) as HTMLInputElement;
            active.addEventListener("change", () => (isActive = active.checked));
            const row = h("div", { class: "orl-row orl-end" });
            const cancel = h("span", {});
            const save = h("span", {});
            row.append(cancel, save);
            append(root2, list, add, h("label", { class: "orl-label" }, "Strategy", sel), h("label", { class: "orl-row" }, active, "Active"), mine && strategy !== "priority" ? h("p", { class: "orl-warning" }, "LearnHarness combos normally use priority so your model is always tried first.") : null, row);
            container.append(root2);
            ctx.ui.mountButton(cancel, { label: "Cancel", variant: "outline", onClick: () => dlg.dispose() }, { signal: sig });
            ctx.ui.mountButton(
              save,
              {
                label: "Review changes",
                onClick: async () => {
                  const ok = await confirmDialog(ctx, {
                    title: `Save ${c.name}?`,
                    body: ["OmniRoute applies this to the next request that uses the combo."],
                    diff: [
                      { label: "Models", before: c.models.join(" → "), after: models.join(" → ") },
                      { label: "Strategy", before: c.strategy, after: strategy },
                      { label: "Active", before: String(c.isActive), after: String(isActive) },
                    ],
                    warning: mine ? undefined : "This combo wasn't created by the plugin; other OmniRoute clients may rely on it.",
                    confirm: "Save",
                  });
                  if (!ok) return;
                  await rpc("combos.update", { id: c.id, fingerprint: c.fingerprint, edit: { models, strategy, isActive } });
                  dlg.dispose();
                  resolve();
                  await renderBody();
                },
              },
              { signal: sig }
            );
          },
        },
        { signal }
      );
    });
  }

  // ── Overview ───────────────────────────────────────────────────────────
  async function overviewTab(host: HTMLElement): Promise<void> {
    const o = await rpc<{ version: string | null; health: unknown; healthError: { message: string } | null; usage: unknown; usageError: { message: string } | null }>("overview");
    host.append(h("p", {}, o.version ? `OmniRoute ${o.version}` : "OmniRoute (version unknown)"));
    const u = o.usage as Record<string, unknown> | null;
    if (u && typeof u === "object") {
      const tiles = h("div", { class: "orl-tiles" });
      for (const [k, label, f] of [
        ["totalRequests", "Requests", fmt.int],
        ["totalPromptTokens", "Input tokens", fmt.int],
        ["totalCompletionTokens", "Output tokens", fmt.int],
        ["totalCost", "Cost", fmt.usd],
      ] as const) {
        const v = u[k];
        if (typeof v === "number") tiles.append(h("div", { class: "orl-tile" }, h("div", { class: "orl-tile-v" }, f(v)), h("div", { class: "orl-muted" }, label)));
      }
      if (tiles.childNodes.length) host.append(tiles);
      const series = findSeries(u);
      if (series.length > 1) host.append(h("h4", {}, "Requests over time"), barChart(series, { unit: fmt.int }));
      for (const [key, title] of [["byModel", "By model"], ["byProvider", "By provider"]] as const) {
        const group = u[key];
        if (!group || typeof group !== "object") continue;
        const rows = Object.entries(group as Record<string, unknown>).map(([name, v]) => ({ name, ...(v && typeof v === "object" ? (v as Record<string, unknown>) : { value: v }) }));
        const table = autoTable(rows);
        if (table) host.append(h("h4", {}, title), table);
      }
      const more = h("details", {}, h("summary", {}, "All usage data"), jsonTree(u));
      host.append(more);
    } else if (o.usageError) host.append(h("p", { class: "orl-error" }, o.usageError.message));
    if (o.health) host.append(h("details", {}, h("summary", {}, "Health report"), jsonTree(o.health)));
    else if (o.healthError) host.append(h("p", { class: "orl-error" }, o.healthError.message));
    // Explorer items the user pinned (BRIEF 4.7 "promotion").
    for (const p of pinned) {
      const unpin = h("button", { class: "orl-mini", type: "button" }, "Unpin");
      unpin.addEventListener("click", () => {
        pinned.splice(pinned.indexOf(p), 1);
        try {
          localStorage.setItem("omniroute-lh:pins", JSON.stringify(pinned));
        } catch {
          /* ignore */
        }
        void renderBody();
      });
      const card = h("div", { class: "orl-card" }, h("div", { class: "orl-row" }, h("h4", {}, p.path), unpin));
      host.append(card);
      try {
        renderData(card, await rpc<unknown>("explorer.get", { path: p.path, params: p.params }));
      } catch (e) {
        showError(card, e);
      }
    }
  }

  /** Best-effort: find a {date|day|time → requests|count} array in the usage payload (shape varies by version). */
  function findSeries(u: Record<string, unknown>): { label: string; value: number }[] {
    for (const v of Object.values(u)) {
      if (!Array.isArray(v) || v.length < 2) continue;
      const pts = v.flatMap((r) => {
        if (!r || typeof r !== "object") return [];
        const o = r as Record<string, unknown>;
        const label = o.date ?? o.day ?? o.time ?? o.hour ?? o.period;
        const value = o.requests ?? o.count ?? o.totalRequests;
        return typeof label === "string" && typeof value === "number" ? [{ label, value }] : [];
      });
      if (pts.length >= 2) return pts.slice(-60);
    }
    return [];
  }

  // ── Recent routing ─────────────────────────────────────────────────────
  let scope: "lh" | "all" = "lh";
  async function recentTab(host: HTMLElement): Promise<void> {
    const toggle = h("label", { class: "orl-row" });
    const cb = h("input", { type: "checkbox", checked: scope === "all" }) as HTMLInputElement;
    cb.addEventListener("change", () => {
      scope = cb.checked ? "all" : "lh";
      void renderBody();
    });
    toggle.append(cb, "Show all OmniRoute traffic (not only LearnHarness)");
    host.append(toggle);
    const rows = await rpc<CallLogRow[]>("callLogs", { scope, limit: 150 });
    if (!rows.length) {
      host.append(h("p", { class: "orl-muted" }, scope === "lh" ? "No requests from LearnHarness's key yet. Send a message to the teacher, or check the key name in the settings." : "No requests yet."));
      return;
    }
    const t = h("table", { class: "orl-table" });
    t.append(h("thead", {}, h("tr", {}, ...["Time", "Asked for", "Served by", "Fallbacks", "Latency", "Tokens in/out", "Cost", "Status"].map((x) => h("th", {}, x)))));
    const tb = h("tbody", {});
    for (const r of rows)
      tb.append(
        h(
          "tr",
          { class: r.status >= 400 || r.error ? "orl-row-err" : "" },
          h("td", { title: fmt.time(r.timestamp) }, fmt.ago(r.timestamp)),
          h("td", {}, r.comboName ?? r.requestedModel ?? "–"),
          h("td", {}, `${r.provider ?? "?"} · ${r.model ?? "?"}`, r.account ? h("div", { class: "orl-muted" }, r.account) : null),
          h("td", {}, r.fallbackSteps ? String(r.fallbackSteps) : ""),
          h("td", {}, fmt.ms(r.durationMs)),
          h("td", {}, `${fmt.int(r.tokensIn)} / ${fmt.int(r.tokensOut)}`, r.cacheHit ? h("div", { class: "orl-muted" }, "cache hit") : null),
          h("td", {}, fmt.usd(r.costUsd)),
          h("td", { title: r.error ?? "" }, r.active ? "running" : String(r.status || ""))
        )
      );
    t.append(tb);
    host.append(h("div", { class: "orl-table-wrap" }, t));
  }

  // ── Explorer ───────────────────────────────────────────────────────────
  let spec: ExplorerEndpoint[] | null = null;
  let picked: ExplorerEndpoint | null = null;
  const pinned = loadPins();
  async function explorerTab(host: HTMLElement): Promise<void> {
    spec ??= await rpc<ExplorerEndpoint[]>("explorer.spec");
    const layout = h("div", { class: "orl-explorer" });
    const side = h("div", { class: "orl-ex-side" });
    const main = h("div", { class: "orl-ex-main" });
    layout.append(side, main);
    host.append(h("p", { class: "orl-muted" }, `Read-only view of ${spec.length} OmniRoute endpoints. Secrets are removed before anything reaches this page.`), layout);
    const search = h("input", { class: "orl-input", placeholder: "Search endpoints", "aria-label": "Search endpoints" }) as HTMLInputElement;
    const list = h("div", { class: "orl-ex-list" });
    side.append(search, list);
    const drawList = () => {
      clear(list);
      const q = search.value.toLowerCase();
      const groups = new Map<string, ExplorerEndpoint[]>();
      for (const e of spec!) {
        if (q && !e.path.toLowerCase().includes(q) && !e.summary.toLowerCase().includes(q)) continue;
        const g = e.path.split("/")[2] ?? "other";
        groups.set(g, [...(groups.get(g) ?? []), e]);
      }
      for (const [g, items] of groups) {
        const d = h("details", { open: !!q }, h("summary", {}, `${g} (${items.length})`));
        for (const e of items) d.append(h("button", { class: `orl-ex-item${picked?.path === e.path ? " orl-tab-on" : ""}`, type: "button", title: e.summary, onclick: () => ((picked = e), drawList(), void drawMain()) }, e.path.replace(/^\/api/, "")));
        list.append(d);
      }
    };
    search.addEventListener("input", drawList);
    const drawMain = async () => {
      clear(main);
      if (!picked) {
        main.append(h("p", { class: "orl-muted" }, "Pick an endpoint on the left."));
        return;
      }
      const ep = picked;
      append(main, h("h4", {}, ep.path), ep.summary ? h("p", {}, ep.summary) : null);
      const inputs = new Map<string, HTMLInputElement>();
      const form = h("div", { class: "orl-ex-form" });
      for (const p of ep.parameters) {
        const i = h("input", { class: "orl-input", placeholder: p.description || p.name, "aria-label": p.name }) as HTMLInputElement;
        inputs.set(p.name, i);
        form.append(h("label", { class: "orl-label" }, `${p.name}${p.required || p.in === "path" ? " *" : ""}`, i));
      }
      const out = h("div", {});
      const row = h("div", { class: "orl-row" });
      const fetchSlot = h("span", {});
      const pinSlot = h("span", {});
      row.append(fetchSlot, pinSlot);
      main.append(form, row, out);
      const params = () => Object.fromEntries([...inputs].map(([k, i]) => [k, i.value.trim()]));
      ctx.ui.mountButton(
        fetchSlot,
        {
          label: "Load",
          size: "sm",
          onClick: async () => {
            clear(out);
            try {
              const data = await rpc<unknown>("explorer.get", { path: ep.path, params: params() });
              renderData(out, data);
            } catch (e) {
              showError(out, e);
            }
          },
        },
        { signal }
      );
      ctx.ui.mountButton(pinSlot, { label: "Pin to Overview", size: "sm", variant: "outline", onClick: () => savePin({ path: ep.path, params: params() }) }, { signal });
    };
    drawList();
    await drawMain();
  }

  function renderData(out: HTMLElement, data: unknown): void {
    const table = autoTable(data) ?? autoTable(data && typeof data === "object" ? Object.values(data as object).find(Array.isArray) : null);
    let raw = false;
    const holder = h("div", {});
    const draw = () => {
      clear(holder);
      holder.append(raw ? h("pre", { class: "orl-raw" }, JSON.stringify(data, null, 2)) : table ?? jsonTree(data));
    };
    const toggle = h("button", { class: "orl-mini", type: "button", onclick: () => ((raw = !raw), draw()) }, "Raw JSON");
    out.append(toggle, holder);
    draw();
  }

  function loadPins(): { path: string; params: Record<string, string> }[] {
    try {
      return JSON.parse(localStorage.getItem("omniroute-lh:pins") ?? "[]") as { path: string; params: Record<string, string> }[];
    } catch {
      return [];
    }
  }
  function savePin(p: { path: string; params: Record<string, string> }): void {
    if (pinned.some((x) => x.path === p.path && JSON.stringify(x.params) === JSON.stringify(p.params))) return;
    pinned.push(p);
    try {
      localStorage.setItem("omniroute-lh:pins", JSON.stringify(pinned.slice(-20)));
    } catch {
      /* storage unavailable: pin lasts for this session */
    }
  }

  // ── Change log ─────────────────────────────────────────────────────────
  async function changesTab(host: HTMLElement): Promise<void> {
    const list = await rpc<ChangeLogEntry[]>("changes.list");
    if (!list.length) {
      host.append(h("p", { class: "orl-muted" }, "The plugin hasn't changed anything in OmniRoute yet."));
      return;
    }
    for (const e of list) {
      const card = h("div", { class: "orl-card" }, h("div", { class: "orl-row" }, h("strong", {}, e.objectName), h("span", { class: "orl-chip" }, e.action), h("span", { class: "orl-muted" }, fmt.time(e.at)), e.revertedAt ? h("span", { class: "orl-chip" }, `reverted ${fmt.ago(e.revertedAt)}`) : null));
      const d = h("details", {}, h("summary", {}, "Before / after"), h("div", { class: "orl-two" }, jsonTree(e.before), jsonTree(e.after)));
      card.append(d);
      if (!e.revertedAt && e.action !== "bootstrap") {
        const slot = h("span", {});
        card.append(slot);
        ctx.ui.mountButton(
          slot,
          {
            label: "Revert",
            size: "xs",
            variant: "outline",
            onClick: async () => {
              if (!(await confirmDialog(ctx, { title: `Revert this change to ${e.objectName}?`, body: ["Restores the state saved before the change."], confirm: "Revert" }))) return;
              await rpc("changes.revert", { id: e.id });
              await renderBody();
            },
          },
          { signal }
        );
      }
      host.append(card);
    }
  }

  // ── refresh: on open, interval, after each teacher turn, on routing changes ──
  renderTabs();
  void renderBanner();
  void renderBody();
  let timer: ReturnType<typeof setInterval> | null = null;
  void rpc<{ settings: PublicSettings }>("settings.get")
    .then((r) => {
      if (signal.aborted) return;
      timer = setInterval(() => {
        if (tab === "recent" || tab === "overview") void renderBody();
        void renderBanner();
      }, r.settings.refreshSeconds * 1000);
    })
    .catch(() => undefined);
  const offN = ctx.onNotification((n) => {
    if (n.topic === "turn-settled" && (tab === "recent" || tab === "overview")) void renderBody();
    if (n.topic === "turn-settled" || n.topic === "manual-step" || n.topic === "runtime-changed") void renderBanner();
    if (n.topic === "routing-changed" && tab === "routing") void renderBody();
  });
  const offR = ctx.onResync(() => {
    void renderBanner();
    void renderBody();
  });
  return () => {
    if (timer) clearInterval(timer);
    offN();
    offR();
  };
}
