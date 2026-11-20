// Minimal DOM helpers. Text is always inserted with textContent — never innerHTML —
// because everything shown comes from OmniRoute and is untrusted.

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | undefined | ((ev: Event) => void)>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (typeof v === "function") el.addEventListener(k.replace(/^on/, "").toLowerCase(), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  append(el, ...children);
  return el;
}

export function append(el: Element, ...children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
}

export function clear(el: Element): void {
  while (el.firstChild) el.firstChild.remove();
}

export const fmt = {
  int: (n: number | null | undefined) => (typeof n === "number" ? n.toLocaleString() : "–"),
  usd: (n: number | null | undefined) => (typeof n === "number" ? `$${n < 0.01 && n > 0 ? n.toFixed(4) : n.toFixed(2)}` : "–"),
  ms: (n: number | null | undefined) => (typeof n === "number" ? (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`) : "–"),
  time: (iso: string | null | undefined) => {
    if (!iso) return "–";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  },
  ago: (iso: string | null | undefined) => {
    if (!iso) return "–";
    const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (!Number.isFinite(s)) return iso;
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.round(s / 60)}m ago`;
    if (s < 86400) return `${Math.round(s / 3600)}h ago`;
    return `${Math.round(s / 86400)}d ago`;
  },
};

/** Collapsible JSON tree built from DOM nodes (Explorer, Overview details). */
export function jsonTree(value: unknown, depth = 0): Node {
  if (value === null || typeof value !== "object") {
    return h("span", { class: `orl-json-${value === null ? "null" : typeof value}` }, typeof value === "string" ? JSON.stringify(value) : String(value));
  }
  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>);
  const details = h("details", { class: "orl-json", open: depth < 1 });
  details.append(h("summary", {}, Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`));
  const list = h("div", { class: "orl-json-body" });
  for (const [k, v] of entries.slice(0, 500)) list.append(h("div", { class: "orl-json-row" }, h("span", { class: "orl-json-key" }, `${k}: `), jsonTree(v, depth + 1)));
  if (entries.length > 500) list.append(h("div", { class: "orl-muted" }, `… ${entries.length - 500} more`));
  details.append(list);
  return details;
}

/** Sortable table for arrays of flat objects; returns null when the data isn't table-shaped. */
export function autoTable(value: unknown): HTMLElement | null {
  if (!Array.isArray(value) || value.length === 0 || !value.every((r) => r && typeof r === "object" && !Array.isArray(r))) return null;
  const rows = value as Record<string, unknown>[];
  const cols = [...new Set(rows.slice(0, 50).flatMap((r) => Object.keys(r)))].filter((c) => rows.some((r) => r[c] === null || typeof r[c] !== "object")).slice(0, 12);
  if (cols.length === 0) return null;
  let sortCol: string | null = null;
  let asc = true;
  const table = h("table", { class: "orl-table" });
  const render = () => {
    clear(table);
    const head = h("tr", {});
    for (const c of cols)
      head.append(
        h(
          "th",
          {
            onclick: () => {
              asc = sortCol === c ? !asc : true;
              sortCol = c;
              render();
            },
          },
          c + (sortCol === c ? (asc ? " ▲" : " ▼") : "")
        )
      );
    table.append(h("thead", {}, head));
    const sorted = sortCol ? [...rows].sort((a, b) => cmp(a[sortCol!], b[sortCol!]) * (asc ? 1 : -1)) : rows;
    const body = h("tbody", {});
    for (const r of sorted.slice(0, 500)) {
      const tr = h("tr", {});
      for (const c of cols) {
        const v = r[c];
        tr.append(h("td", {}, v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v).slice(0, 80) : String(v)));
      }
      body.append(tr);
    }
    table.append(body);
  };
  render();
  return h("div", { class: "orl-table-wrap" }, table);
}

function cmp(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/** Tiny inline-SVG bar chart (no host chart widget exists). */
export function barChart(points: { label: string; value: number }[], opts: { height?: number; unit?: (n: number) => string } = {}): SVGSVGElement {
  const NS = "http://www.w3.org/2000/svg";
  const height = opts.height ?? 120;
  const w = Math.max(points.length * 14, 200);
  const max = Math.max(1, ...points.map((p) => p.value));
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${height + 16}`);
  svg.setAttribute("class", "orl-chart");
  svg.setAttribute("role", "img");
  points.forEach((p, i) => {
    const bh = (p.value / max) * height;
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", String(i * 14 + 2));
    rect.setAttribute("y", String(height - bh));
    rect.setAttribute("width", "10");
    rect.setAttribute("height", String(Math.max(bh, p.value > 0 ? 1 : 0)));
    rect.setAttribute("rx", "2");
    const title = document.createElementNS(NS, "title");
    title.textContent = `${p.label}: ${opts.unit ? opts.unit(p.value) : p.value}`;
    rect.append(title);
    svg.append(rect);
  });
  return svg;
}
