// Confirmation dialog for every write (BRIEF 4.5): says exactly what changes.
import type { PluginFrontendContext } from "learnharness-plugin-api";
import { h } from "./dom.ts";

export interface ConfirmOptions {
  title: string;
  body: string[];
  /** Optional before → after rows. */
  diff?: { label: string; before: string; after: string }[];
  /** Extra warning (shared resources, combos used by LearnHarness, deletes). */
  warning?: string;
  confirm: string;
  destructive?: boolean;
}

export function confirmDialog(ctx: PluginFrontendContext, opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v: boolean) => {
      if (settled) return;
      settled = true;
      handle.dispose();
      resolve(v);
    };
    const ac = new AbortController();
    const content = (container: HTMLElement, signal: AbortSignal) => {
      const root = h("div", { class: "orl-root orl-confirm" }, h("h3", {}, opts.title), ...opts.body.map((b) => h("p", {}, b)));
      if (opts.diff?.length) {
        const t = h("table", { class: "orl-table" }, h("thead", {}, h("tr", {}, h("th", {}, ""), h("th", {}, "Before"), h("th", {}, "After"))));
        const tb = h("tbody", {});
        for (const d of opts.diff) tb.append(h("tr", { class: d.before === d.after ? "orl-muted" : "orl-changed" }, h("td", {}, d.label), h("td", {}, d.before), h("td", {}, d.after)));
        t.append(tb);
        root.append(t);
      }
      if (opts.warning) root.append(h("p", { class: "orl-warning" }, opts.warning));
      const row = h("div", { class: "orl-row orl-end" });
      const cancel = h("span", {});
      const ok = h("span", {});
      row.append(cancel, ok);
      root.append(row);
      container.append(root);
      ctx.ui.mountButton(cancel, { label: "Cancel", variant: "outline", onClick: () => finish(false) }, { signal });
      ctx.ui.mountButton(ok, { label: opts.confirm, variant: opts.destructive ? "destructive" : "default", onClick: () => finish(true) }, { signal });
    };
    const handle = ctx.ui.openDialog({ title: opts.title, content, onClose: () => finish(false) }, { signal: ac.signal });
  });
}
