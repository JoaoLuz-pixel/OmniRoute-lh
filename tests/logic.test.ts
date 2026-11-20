import { test } from "node:test";
import assert from "node:assert/strict";
import { isSecretField, redact, REDACTED } from "../src/backend/redact.ts";
import { applyPatch, defaultSettings, mask, normaliseBaseUrl, toPublic } from "../src/backend/settings.ts";
import { editableFingerprint, explorerAllowed, preserveSteps, stepLabel, validateEdit } from "../src/backend/services.ts";
import { manualStepStatus, matchOmniRouteModels, takeSnapshot, targetsNeeded } from "../src/backend/lh.ts";
import { nodeSatisfiesOmniRoute } from "../src/backend/system.ts";
import type { ModelCatalogResponse } from "learnharness-plugin-api";

test("redact removes secrets at any depth and keeps metadata", () => {
  const input = {
    apiKey: "sk-live-abcdefghijklmnopqrstuvwx",
    tokens: { in: 10, out: 20 },
    apiKeyName: "LearnHarness",
    nested: [{ accessToken: "x", refreshToken: "y", name: "ok", maxTokens: 100 }],
    providerSpecificData: { cookie: "c" },
    requestBody: "{prompt}",
    note: "Bearer abc.def",
    text: "key is sk-abcdefghijklmnopqrstuvwxyz012345 here",
    masterKey: "m",
    password: "p",
    keyPresent: true,
  };
  const out = redact(input) as Record<string, unknown>;
  assert.equal(out.apiKey, REDACTED);
  assert.deepEqual(out.tokens, { in: 10, out: 20 });
  assert.equal(out.apiKeyName, "LearnHarness");
  const n = (out.nested as Record<string, unknown>[])[0]!;
  assert.equal(n.accessToken, REDACTED);
  assert.equal(n.refreshToken, REDACTED);
  assert.equal(n.name, "ok");
  assert.equal(n.maxTokens, 100);
  assert.equal("providerSpecificData" in out, false);
  assert.equal("requestBody" in out, false);
  assert.equal(out.note, REDACTED);
  assert.equal(out.text, `key is ${REDACTED} here`);
  assert.equal(out.masterKey, REDACTED);
  assert.equal(out.password, REDACTED);
  assert.equal(out.keyPresent, true);
});

test("secret field names", () => {
  for (const n of ["apiKey", "api_key", "token", "accessToken", "id_token", "secret", "clientSecret", "password", "authorization", "cookie", "sessionToken", "privateKey"]) assert.ok(isSecretField(n), n);
  for (const n of ["tokens", "tokensIn", "maxTokens", "cacheReadTokens", "apiKeyName", "name", "model", "keyPresent"]) assert.ok(!isSecretField(n), n);
});

test("settings validation", () => {
  const d = defaultSettings();
  assert.equal(normaliseBaseUrl("http://127.0.0.1:20128/v1/").ok && (normaliseBaseUrl("http://127.0.0.1:20128/v1/") as { url: string }).url, "http://127.0.0.1:20128");
  assert.equal(normaliseBaseUrl("ftp://x").ok, false);
  assert.equal(normaliseBaseUrl("http://u:p@host").ok, false);
  assert.equal(applyPatch(d, { port: 80 }).ok, false);
  assert.equal(applyPatch(d, { managementKey: "has space key" }).ok, false);
  assert.equal(applyPatch(d, { refreshSeconds: 1 }).ok, false);
  const r = applyPatch(d, { managementKey: "  om-1234567890abcdef  ", port: 20200 });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.settings.managementKey, "om-1234567890abcdef");
    assert.equal(r.settings.baseUrl, "http://127.0.0.1:20200");
    const pub = toPublic(r.settings);
    assert.equal(pub.managementKeyHint, "…cdef");
    assert.equal(JSON.stringify(pub).includes("om-1234567890abcdef"), false, "public settings never contain the key");
  }
  assert.equal(mask("short"), "…");
});

test("combo step labels and step preservation", () => {
  assert.equal(stepLabel("cc/claude-opus"), "cc/claude-opus");
  assert.equal(stepLabel({ kind: "model", providerId: "openai", model: "gpt-5" }), "openai/gpt-5");
  assert.equal(stepLabel({ model: "openai/gpt-5", providerId: "openai" }), "openai/gpt-5");
  assert.equal(stepLabel({ kind: "combo-ref", comboName: "fast" }), "→ fast");
  const original = [{ kind: "model", providerId: "a", model: "m1", connectionId: "conn-1" }, "b/m2"];
  const out = preserveSteps(original, ["b/m2", "a/m1", "c/m3"]);
  assert.deepEqual(out, ["b/m2", original[0], "c/m3"], "reorder keeps the pinned step object; new model is a plain string");
});

test("edit validation", () => {
  assert.match(validateEdit({ models: [] }) ?? "", /at least one/);
  assert.equal(validateEdit({ models: ["cc/claude-opus-4-6", "auto/coding"] }), null);
  assert.ok(validateEdit({ models: ["bad\nmodel"] }));
  assert.ok(validateEdit({ strategy: "DROP TABLE" }));
  const fp = editableFingerprint({ id: "1", name: "n", strategy: "priority", isActive: true, models: ["a"], raw: {} });
  assert.equal(typeof fp, "string");
});

test("explorer denylist", () => {
  for (const p of ["/api/keys", "/api/keys/{id}/reveal", "/api/oauth/x", "/api/db-backups", "/api/settings", "/api/usage/call-logs/{id}", "/api/openapi/try", "/api/v1/chat/completions", "/api/{...omnirouteApiCatchAll}", "/api/shutdown"]) assert.equal(explorerAllowed(p), false, p);
  for (const p of ["/api/usage/history", "/api/combos", "/api/providers/health-matrix", "/api/usage/call-logs", "/api/pricing"]) assert.equal(explorerAllowed(p), true, p);
});

test("Node version check matches OmniRoute 3.8 engines", () => {
  assert.ok(nodeSatisfiesOmniRoute("v22.22.2"));
  assert.ok(!nodeSatisfiesOmniRoute("v22.22.1"));
  assert.ok(!nodeSatisfiesOmniRoute("v23.1.0"));
  assert.ok(nodeSatisfiesOmniRoute("v24.0.0"));
  assert.ok(nodeSatisfiesOmniRoute("v26.13.0"));
  assert.ok(!nodeSatisfiesOmniRoute("v27.0.0"));
  assert.ok(!nodeSatisfiesOmniRoute("v20.11.0"));
});

test("model matching LearnHarness → OmniRoute", () => {
  const om = ["cc/claude-opus-4-6", "anthropic/claude-opus-4-6", "openai/gpt-5", "auto/coding", "gh/claude-opus-4-6-20260101"];
  const m = matchOmniRouteModels({ provider: "anthropic", id: "claude-opus-4-6" }, om);
  assert.equal(m[0]?.id, "anthropic/claude-opus-4-6");
  assert.ok(m.some((x) => x.id === "cc/claude-opus-4-6" && x.exact));
  assert.ok(m.some((x) => x.id === "gh/claude-opus-4-6-20260101" && !x.exact));
  assert.deepEqual(matchOmniRouteModels({ provider: "x", id: "nothing" }, om), []);
});

function catalog(slots: Partial<Record<"strong" | "cheap" | "vision", { provider: string; id: string } | null>>, rolePins: Record<string, { provider: string; id: string } | null> = {}): ModelCatalogResponse {
  const slot = (m: { provider: string; id: string } | null | undefined) => (m ? { model: m } : null);
  return {
    models: [],
    defaults: null,
    providers: [],
    slots: { strong: slot(slots.strong), cheap: slot(slots.cheap), vision: slot(slots.vision) } as unknown as ModelCatalogResponse["slots"],
    rolePins: Object.fromEntries(["researcher", "demoBuilder", "visualMaker", "extractor", "auditor", "sideQuestion"].map((r) => [r, rolePins[r] ? { model: rolePins[r] } : slot(slots.strong)])) as unknown as ModelCatalogResponse["rolePins"],
  };
}
const emptyState = { version: 1 as const, ownedCombos: {}, preferred: {}, snapshotAt: null, bypassingChats: {} };

test("manual step: pending until slots point at the combos via Custom endpoint", () => {
  const before = catalog({ strong: { provider: "anthropic", id: "claude-opus" }, cheap: { provider: "openai", id: "gpt-mini" }, vision: null });
  const s1 = manualStepStatus(before, emptyState);
  assert.equal(s1.complete, false);
  assert.deepEqual(s1.pending.map((p) => p.target), ["strong", "cheap"]);
  assert.equal(s1.pending[0]?.expected, "custom/OmniRoute-Strong");

  const after = catalog({ strong: { provider: "custom", id: "OmniRoute-Strong" }, cheap: { provider: "custom", id: "OmniRoute-Cheap" }, vision: null });
  const s2 = manualStepStatus(after, emptyState);
  assert.equal(s2.complete, true);
  assert.equal(s2.pending.length, 0);
});

test("role overrides get their own combo only when they differ", () => {
  const c = catalog({ strong: { provider: "a", id: "big" }, cheap: { provider: "a", id: "small" } }, { auditor: { provider: "b", id: "judge" } });
  assert.deepEqual(targetsNeeded(c), ["strong", "cheap", "auditor"]);
  const snap = takeSnapshot(c, {});
  assert.deepEqual(snap.auditor, { provider: "b", id: "judge" });
  // After switching, the snapshot is not overwritten by combo ids.
  const switched = catalog({ strong: { provider: "custom", id: "OmniRoute-Strong" }, cheap: { provider: "custom", id: "OmniRoute-Cheap" } }, { auditor: { provider: "custom", id: "OmniRoute-Auditor" } });
  assert.deepEqual(takeSnapshot(switched, snap), snap);
});
