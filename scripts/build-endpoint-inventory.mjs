#!/usr/bin/env node
// Builds an inventory of an OmniRoute checkout's HTTP routes.
//
// Usage: node scripts/build-endpoint-inventory.mjs <omniroute-clone> [--json out.json] [--md out.md]
//
// Sources, in order of authority:
//   1. src/app/api/**/route.ts  — the real handlers (methods, auth guard)
//   2. docs/openapi.yaml        — summaries/tags only (may lag the handlers)
//
// Only Node built-ins; reads the clone, never writes into it.

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const args = process.argv.slice(2);
const root = args[0];
if (!root || !existsSync(join(root, "src", "app", "api"))) {
  console.error("usage: build-endpoint-inventory.mjs <omniroute-clone> [--json file] [--md file]");
  process.exit(2);
}
const opt = (name) => {
  const i = args.indexOf(name);
  return i > 0 ? args[i + 1] : undefined;
};

const apiDir = join(root, "src", "app", "api");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const GUARDS = [
  "requireManagementAuth",
  "requireAdminAuth",
  "requireCloudAgentManagementAuth",
  "requireCliToolsAuth",
  "requireCliProxyManagementAuth",
  "requireInventoryReadAuth",
  "requireTailscaleAuth",
  "requireOAuthImportAuth",
  "requireOAuthRouteAuth",
  "requireOAuthAuth",
  "requireImportAuth",
  "requireAuth",
  "isAuthenticated",
  "checkAuth",
  "authenticate",
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === "route.ts" || name === "route.js") out.push(p);
  }
  return out;
}

// Next.js folder segments → URL path. (group) segments vanish, [x] → {x}, [...x]/[[...x]] → {...x}
function toUrl(file) {
  const segs = relative(apiDir, file).split(sep).slice(0, -1);
  const parts = [];
  for (const s of segs) {
    if (/^\(.*\)$/.test(s)) continue;
    const m = s.match(/^\[\[?(\.\.\.)?([^\]]+)\]\]?$/);
    parts.push(m ? `{${m[1] ?? ""}${m[2]}}` : s);
  }
  // /api/v1/* is served as /v1/* by OmniRoute's rewrites; keep both visible.
  return "/api/" + parts.join("/");
}

function parseOpenApi(file) {
  const map = new Map(); // "METHOD path" -> {summary, tags}
  if (!existsSync(file)) return map;
  let path = null;
  let method = null;
  let inTags = false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^ {2}(\/[^:]*):\s*$/))) { path = m[1]; method = null; continue; }
    if (/^\S/.test(line)) { path = null; method = null; continue; }
    if (!path) continue;
    if ((m = line.match(/^ {4}(get|post|put|patch|delete):\s*$/))) {
      method = m[1].toUpperCase();
      map.set(`${method} ${path}`, { summary: "", tags: [] });
      inTags = false;
      continue;
    }
    if (!method) continue;
    const entry = map.get(`${method} ${path}`);
    if ((m = line.match(/^ {6}summary:\s*(.*)$/))) { entry.summary = m[1].replace(/^['"]|['"]$/g, ""); inTags = false; continue; }
    if ((m = line.match(/^ {6}tags:\s*\[(.*)\]\s*$/))) { entry.tags = m[1].split(",").map((t) => t.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean); continue; }
    if (/^ {6}tags:\s*$/.test(line)) { inTags = true; continue; }
    if (inTags && (m = line.match(/^ {8}-\s*(.+)$/))) { entry.tags.push(m[1].replace(/^['"]|['"]$/g, "")); continue; }
    if (/^ {6}\S/.test(line)) inTags = false;
  }
  return map;
}

const openapi = parseOpenApi(join(root, "docs", "openapi.yaml"));
const rows = [];
for (const file of walk(apiDir).sort()) {
  const src = readFileSync(file, "utf8");
  const methods = METHODS.filter((m) =>
    new RegExp(`export\\s+(async\\s+)?(function|const)\\s+${m}\\b|export\\s*\\{[^}]*\\b${m}\\b`).test(src)
  );
  const guards = GUARDS.filter((g) => new RegExp(`\\b${g}\\(`).test(src));
  const path = toUrl(file);
  const area = path.split("/")[2] ?? "";
  for (const method of methods) {
    const key = `${method} ${path}`;
    const alt = path.startsWith("/api/v1/") ? `${method} ${path.slice(4)}` : null;
    const doc = openapi.get(key) ?? (alt ? openapi.get(alt) : undefined);
    rows.push({
      method,
      path,
      area,
      auth: guards.length ? guards.join("+") : "none-detected",
      streaming: /text\/event-stream|ReadableStream|EventSource/.test(src),
      summary: doc?.summary ?? "",
      tags: doc?.tags ?? [],
      inOpenApi: Boolean(doc),
      source: relative(root, file).split(sep).join("/"),
    });
  }
}

const jsonOut = opt("--json");
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ generatedFrom: "omniroute src/app/api + docs/openapi.yaml", count: rows.length, rows }, null, 2) + "\n");

const mdOut = opt("--md");
if (mdOut) {
  const esc = (s) => String(s).replace(/\|/g, "\\|");
  const lines = [
    "| Method | Path | Auth guard | Stream | Summary (openapi.yaml) |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.method} | \`${esc(r.path)}\` | ${r.auth} | ${r.streaming ? "yes" : ""} | ${esc(r.summary)} |`),
  ];
  writeFileSync(mdOut, lines.join("\n") + "\n");
}

const by = (k) => rows.reduce((a, r) => ((a[r[k]] = (a[r[k]] ?? 0) + 1), a), {});
console.log(JSON.stringify({ rows: rows.length, byMethod: by("method"), byAuth: by("auth"), notInOpenApi: rows.filter((r) => !r.inOpenApi).length }, null, 1));
