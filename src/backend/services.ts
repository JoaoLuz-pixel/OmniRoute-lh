// OmniRoute features used by the plugin, on top of the raw client.
// Endpoint facts: docs/omniroute-endpoints.md (verified against OmniRoute v3.8.54).
import { randomBytes, randomUUID } from "node:crypto";
import type { CallLogRow, ComboSummary, ConnectionTest, ExplorerEndpoint, Target } from "../shared/protocol.ts";
import { COMBO_NAMES } from "../shared/protocol.ts";
import { asArray, asRecord, OmniRouteClient, OmniRouteError, optNum, optStr } from "./omniroute.ts";
import { redact } from "./redact.ts";

// ── connection test ───────────────────────────────────────────────────────

export async function testConnection(baseUrl: string, key: string, signal: AbortSignal): Promise<ConnectionTest> {
  const anon = new OmniRouteClient({ baseUrl, key: "", signal, timeoutMs: 5000 });
  try {
    const r = await anon.request("/api/health", { anonymous: true });
    if ((r.body as { status?: unknown } | null)?.status !== "ok") {
      return { reachable: true, keyValid: false, version: null, buildSha: null, detail: "Something answered at this address, but it doesn't look like OmniRoute." };
    }
  } catch (error) {
    return { reachable: false, keyValid: false, version: null, buildSha: null, detail: (error as Error).message };
  }
  if (!key) return { reachable: true, keyValid: false, version: null, buildSha: null, detail: "OmniRoute is reachable. Add a management key to see more." };
  // /api/monitoring/health returns the full view (with appVersion) only to a valid manage credential.
  const authed = new OmniRouteClient({ baseUrl, key, signal, timeoutMs: 8000 });
  try {
    const body = asRecord(await authed.getJson("/api/monitoring/health"), "health report");
    const version = optStr(body.appVersion);
    if (!version) {
      return { reachable: true, keyValid: false, version: null, buildSha: null, detail: "OmniRoute is reachable, but it didn't accept the key as a management key (the response was the public view)." };
    }
    // A manage-only route confirms the scope, since no-auth installs let anything through.
    await authed.getJson("/api/combos", { limit: 1 });
    return { reachable: true, keyValid: true, version, buildSha: optStr(body.buildSha), detail: `Connected to OmniRoute ${version}.` };
  } catch (error) {
    return { reachable: true, keyValid: false, version: null, buildSha: null, detail: (error as Error).message };
  }
}

// ── combos ────────────────────────────────────────────────────────────────

export interface RawCombo {
  id: string;
  name: string;
  strategy: string;
  isActive: boolean;
  models: unknown[];
  raw: Record<string, unknown>;
}

function parseCombo(v: unknown): RawCombo {
  const c = asRecord(v, "combo");
  const id = optStr(c.id);
  const name = optStr(c.name);
  if (!id || !name) throw new OmniRouteError("bad-response", "A combo from OmniRoute has no id or name.");
  return { id, name, strategy: optStr(c.strategy) ?? "priority", isActive: c.isActive !== false, models: Array.isArray(c.models) ? c.models : [], raw: c };
}

/** "provider/model" label for a combo step of any shape. */
export function stepLabel(step: unknown): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object") {
    const s = step as Record<string, unknown>;
    if (s.kind === "combo-ref") return `→ ${String(s.comboName ?? "?")}`;
    const provider = optStr(s.providerId) ?? optStr(s.provider);
    const model = optStr(s.model) ?? optStr(s.modelPattern) ?? "?";
    return provider && !model.startsWith(`${provider}/`) ? `${provider}/${model}` : model;
  }
  return "?";
}

export async function listCombos(client: OmniRouteClient): Promise<RawCombo[]> {
  const out: RawCombo[] = [];
  for (let offset = 0; offset < 5000; offset += 200) {
    const body = asRecord(await client.getJson("/api/combos", { offset, limit: 200 }), "combo list");
    const page = asArray(body.combos, "combo list").map(parseCombo);
    out.push(...page);
    const total = optNum(body.total) ?? out.length;
    if (page.length === 0 || out.length >= total) break;
  }
  return out;
}

export async function getCombo(client: OmniRouteClient, id: string): Promise<RawCombo> {
  return parseCombo(await client.getJson(`/api/combos/${encodeURIComponent(id)}`));
}

export function summarise(c: RawCombo, owned: Map<string, Target>): ComboSummary {
  return { id: c.id, name: c.name, strategy: c.strategy, isActive: c.isActive, models: c.models.map(stepLabel), ownedByPlugin: owned.has(c.id), target: owned.get(c.id) ?? null };
}

/** Comparable form of the fields the plugin edits (lost-update guard: OmniRoute has no ETag). */
export function editableFingerprint(c: RawCombo): string {
  return JSON.stringify({ name: c.name, strategy: c.strategy, isActive: c.isActive, models: c.models });
}

export interface ComboEdit {
  models?: string[];
  /** Server-internal (revert): exact step objects as OmniRoute stored them. */
  rawModels?: unknown[];
  strategy?: string;
  isActive?: boolean;
}

/**
 * The editor works in "provider/model" labels. Map each label back to the original
 * step object (keeping connection pins, weights, labels); new labels become plain strings.
 */
export function preserveSteps(original: unknown[], labels: string[]): unknown[] {
  const pool = original.map((step) => ({ step, label: stepLabel(step), used: false }));
  return labels.map((label) => {
    const hit = pool.find((p) => !p.used && p.label === label);
    if (hit) {
      hit.used = true;
      return hit.step;
    }
    return label;
  });
}

const MODEL_RE = /^[\w.:@/\-[\]* ]{1,300}$/;
const STRATEGY_RE = /^[a-z][a-z0-9-]{0,40}$/;

export function validateEdit(edit: ComboEdit): string | null {
  if (edit.models !== undefined) {
    if (!Array.isArray(edit.models) || edit.models.length === 0) return "A combo needs at least one model.";
    if (edit.models.length > 50) return "At most 50 models per combo.";
    for (const m of edit.models) if (typeof m !== "string" || !MODEL_RE.test(m)) return `Invalid model id: ${String(m).slice(0, 60)}`;
  }
  if (edit.strategy !== undefined && (typeof edit.strategy !== "string" || !STRATEGY_RE.test(edit.strategy))) return "Invalid strategy.";
  if (edit.isActive !== undefined && typeof edit.isActive !== "boolean") return "Invalid active flag.";
  if (edit.rawModels !== undefined && (!Array.isArray(edit.rawModels) || edit.rawModels.length === 0 || edit.rawModels.length > 50)) return "A combo needs 1–50 models.";
  return null;
}

/**
 * Update a combo only if it still matches what the user saw (expectedFingerprint).
 * Sends the full models array; PUT and PATCH share one merge handler in OmniRoute.
 */
export async function updateComboGuarded(client: OmniRouteClient, id: string, expectedFingerprint: string, edit: ComboEdit): Promise<{ before: RawCombo; after: RawCombo }> {
  const err = validateEdit(edit);
  if (err) throw new OmniRouteError("invalid-input", err);
  const before = await getCombo(client, id);
  if (editableFingerprint(before) !== expectedFingerprint) {
    throw new OmniRouteError("conflict", `"${before.name}" was changed in OmniRoute since you opened it. Reload and try again.`);
  }
  const body: Record<string, unknown> = {};
  if (edit.rawModels) body.models = edit.rawModels;
  else if (edit.models) body.models = preserveSteps(before.models, edit.models);
  if (edit.strategy) body.strategy = edit.strategy;
  if (edit.isActive !== undefined) body.isActive = edit.isActive;
  await client.request(`/api/combos/${encodeURIComponent(id)}`, { method: "PATCH", body });
  return { before, after: await getCombo(client, id) };
}

export async function createCombo(client: OmniRouteClient, name: string, models: string[], description: string): Promise<RawCombo> {
  const err = validateEdit({ models });
  if (err) throw new OmniRouteError("invalid-input", err);
  const r = await client.request("/api/combos", { method: "POST", body: { name, models, strategy: "priority", description } });
  return parseCombo(r.body);
}

export async function deleteComboGuarded(client: OmniRouteClient, id: string, expectedFingerprint: string): Promise<RawCombo> {
  const before = await getCombo(client, id);
  if (editableFingerprint(before) !== expectedFingerprint) throw new OmniRouteError("conflict", `"${before.name}" was changed in OmniRoute since you opened it.`);
  await client.request(`/api/combos/${encodeURIComponent(id)}`, { method: "DELETE" });
  return before;
}

export const comboNameFor = (t: Target) => COMBO_NAMES[t];

// ── connections ───────────────────────────────────────────────────────────

export interface ConnectionSummary {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  testStatus: string | null;
  lastError: string | null;
  rateLimitedUntil: string | null;
}

export async function listConnections(client: OmniRouteClient): Promise<ConnectionSummary[]> {
  const body = asRecord(await client.getJson("/api/providers"), "provider list");
  // Strip secrets field-by-field into a fixed shape: /api/providers can return raw keys when OmniRoute's reveal setting is on.
  return asArray(body.connections, "provider list").map((v) => {
    const c = asRecord(v, "connection");
    return {
      id: optStr(c.id) ?? "",
      provider: optStr(c.provider) ?? "?",
      name: optStr(c.name) ?? optStr(c.displayName) ?? optStr(c.email) ?? optStr(c.provider) ?? "?",
      isActive: c.isActive === true,
      testStatus: optStr(c.testStatus),
      lastError: optStr(c.lastError),
      rateLimitedUntil: optStr(c.rateLimitedUntil),
    };
  });
}

export async function setConnectionActive(client: OmniRouteClient, id: string, isActive: boolean): Promise<ConnectionSummary> {
  if (typeof isActive !== "boolean" || !id) throw new OmniRouteError("invalid-input", "Invalid connection change.");
  await client.request(`/api/providers/${encodeURIComponent(id)}`, { method: "PATCH", body: { isActive } });
  const all = await listConnections(client);
  const after = all.find((c) => c.id === id);
  if (!after) throw new OmniRouteError("bad-response", "The connection disappeared after the change.");
  return after;
}

// ── call logs ─────────────────────────────────────────────────────────────

export async function callLogs(client: OmniRouteClient, opts: { apiKey?: string; limit?: number; combo?: boolean }): Promise<CallLogRow[]> {
  const body = await client.getJson("/api/usage/call-logs", { apiKey: opts.apiKey, limit: Math.min(opts.limit ?? 100, 500), excludeTests: 1, combo: opts.combo ? "1" : undefined });
  return asArray(body, "call log").map((v) => {
    const r = asRecord(v, "call log row");
    const tokens = (r.tokens && typeof r.tokens === "object" ? r.tokens : {}) as Record<string, unknown>;
    const actions = Array.isArray(r.resilienceActions) ? r.resilienceActions.length : null;
    return {
      id: optStr(r.id) ?? randomUUID(),
      timestamp: optStr(r.timestamp) ?? "",
      status: optNum(r.status) ?? 0,
      requestedModel: optStr(r.requestedModel),
      model: optStr(r.model),
      provider: optStr(r.providerDisplay) ?? optStr(r.provider),
      account: optStr(r.account),
      durationMs: optNum(r.duration),
      tokensIn: optNum(tokens.in) ?? optNum(r.tokensIn),
      tokensOut: optNum(tokens.out) ?? optNum(r.tokensOut),
      costUsd: optNum(r.knownTierCostUsd) ?? optNum(r.cost) ?? optNum(r.costUsd),
      comboName: optStr(r.comboName),
      apiKeyName: optStr(r.apiKeyName),
      fallbackSteps: actions,
      cacheHit: optStr(r.cacheSource) !== null && optStr(r.cacheSource) !== "none",
      error: optStr(r.error)?.slice(0, 300) ?? null,
      active: r.active === true,
    };
  });
}

// ── explorer ──────────────────────────────────────────────────────────────

/** Never fetched by the Explorer (docs/omniroute-endpoints.md). */
export const EXPLORER_DENY = [
  /^\/api\/keys(\/|$)/,
  /^\/api\/oauth/,
  /^\/api\/auth/,
  /^\/api\/db(\/|$|-backups)/,
  /^\/api\/log-export/,
  /^\/api\/tunnels/,
  /^\/api\/vnc-session/,
  /^\/api\/shutdown/,
  /^\/api\/restart/,
  /^\/api\/sync/,
  /^\/api\/cloud/,
  /^\/api\/settings/,
  /^\/api\/cli-tools/,
  /^\/api\/openapi\/try/,
  /^\/api\/usage\/call-logs\/[^/]+/,
  /^\/api\/internal/,
  /^\/api\/v0\//,
  /\{\.\.\./,
  /^\/(api\/)?v1(beta)?\//,
];

export function explorerAllowed(path: string): boolean {
  return path.startsWith("/api/") && !EXPLORER_DENY.some((re) => re.test(path));
}

export async function explorerSpec(client: OmniRouteClient): Promise<ExplorerEndpoint[]> {
  const body = asRecord(await client.getJson("/api/openapi/spec"), "API catalog");
  const out: ExplorerEndpoint[] = [];
  for (const v of asArray(body.endpoints, "API catalog")) {
    const e = asRecord(v, "endpoint");
    if (e.method !== "GET" || e.internal === true || e.loopbackOnly === true) continue;
    const path = optStr(e.path);
    if (!path || !explorerAllowed(path)) continue;
    out.push({
      path,
      summary: (optStr(e.summary) ?? "").slice(0, 200),
      tags: Array.isArray(e.tags) ? e.tags.filter((t): t is string => typeof t === "string").slice(0, 5) : [],
      parameters: (Array.isArray(e.parameters) ? e.parameters : []).flatMap((p) => {
        if (!p || typeof p !== "object") return [];
        const q = p as Record<string, unknown>;
        const name = optStr(q.name);
        const where = optStr(q.in);
        if (!name || (where !== "query" && where !== "path")) return [];
        return [{ name, in: where, required: q.required === true, description: (optStr(q.description) ?? "").slice(0, 200) }];
      }),
    });
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** Fetch one Explorer endpoint: GET only, allow-listed, params validated, response redacted. */
export async function explorerGet(client: OmniRouteClient, template: string, params: Record<string, string>): Promise<unknown> {
  if (!explorerAllowed(template)) throw new OmniRouteError("invalid-input", "This endpoint isn't available in the Explorer.");
  const query: Record<string, string> = {};
  let path = template;
  for (const [k, v] of Object.entries(params ?? {})) {
    if (typeof v !== "string" || v.length > 500 || !/^[\w.-]{1,80}$/.test(k)) throw new OmniRouteError("invalid-input", "Invalid parameter.");
    if (path.includes(`{${k}}`)) path = path.replace(`{${k}}`, encodeURIComponent(v));
    else if (v !== "") query[k] = v;
  }
  if (/\{[^}]+\}/.test(path)) throw new OmniRouteError("invalid-input", "Fill in every path parameter.");
  return redact(await client.getJson(path, query));
}

// ── first-run bootstrap (decision 9) ──────────────────────────────────────

export interface LoginState {
  requireLogin: boolean;
  hasPassword: boolean;
  setupComplete: boolean;
  bootstrapWindow: boolean;
}

export async function loginState(baseUrl: string, signal: AbortSignal): Promise<LoginState> {
  const c = new OmniRouteClient({ baseUrl, key: "", signal });
  const b = asRecord((await c.request("/api/settings/require-login", { anonymous: true })).body, "login settings");
  const hasPassword = b.hasPassword === true;
  const setupComplete = b.setupComplete === true;
  return { requireLogin: b.requireLogin !== false, hasPassword, setupComplete, bootstrapWindow: !hasPassword && !setupComplete && b.settingsUnavailable !== true };
}

export function generatePassword(): string {
  return randomBytes(18).toString("base64url");
}

function sessionCookie(headers: Headers): string {
  const all = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [headers.get("set-cookie") ?? ""];
  return all
    .map((c) => c.split(";")[0]?.trim() ?? "")
    .filter(Boolean)
    .join("; ");
}

/**
 * Fresh install only: set the dashboard password, log in, create the manage key and
 * the LearnHarness inference key, log out. Returns the raw keys (shown once, then stored).
 */
export async function bootstrapFreshInstall(
  baseUrl: string,
  signal: AbortSignal,
  password: string,
  inferenceKeyName: string
): Promise<{ managementKey: string; inferenceKey: string; inferenceKeyName: string }> {
  const state = await loginState(baseUrl, signal);
  if (!state.bootstrapWindow) throw new OmniRouteError("conflict", "This OmniRoute is already set up (it has a password). Create the keys in OmniRoute's dashboard and paste them into the plugin settings.");
  const c = new OmniRouteClient({ baseUrl, key: "", signal, timeoutMs: 20_000 });
  await c.request("/api/settings/require-login", { method: "POST", anonymous: true, body: { password, requireLogin: true } });
  const login = await c.request("/api/auth/login", { method: "POST", anonymous: true, body: { password } });
  const cookie = sessionCookie(login.headers);
  if (!cookie) throw new OmniRouteError("bad-response", "OmniRoute accepted the password but didn't return a session.");
  const headers = { cookie };
  const keyOf = (body: unknown) => {
    const k = optStr(asRecord(body, "new key").key);
    if (!k) throw new OmniRouteError("bad-response", "OmniRoute created a key but didn't return it.");
    return k;
  };
  const manage = keyOf((await c.request("/api/keys", { method: "POST", anonymous: true, headers, body: { name: "LearnHarness plugin (manage)", scopes: ["manage"] } })).body);
  const inference = keyOf((await c.request("/api/keys", { method: "POST", anonymous: true, headers, body: { name: inferenceKeyName } })).body);
  await c.request("/api/auth/logout", { method: "POST", anonymous: true, headers }).catch(() => undefined);
  return { managementKey: manage, inferenceKey: inference, inferenceKeyName };
}

export { redact };
