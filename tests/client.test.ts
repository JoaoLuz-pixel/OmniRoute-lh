// OmniRoute client + services against a fake OmniRoute HTTP server (no real OmniRoute needed).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { OmniRouteClient, OmniRouteError } from "../src/backend/omniroute.ts";
import { callLogs, editableFingerprint, explorerGet, getCombo, listConnections, testConnection, updateComboGuarded } from "../src/backend/services.ts";

const MANAGE = "om-manage-key-123456";
const INFER = "om-infer-key-1234567";
let combo = { id: "c1", name: "OmniRoute-Strong", strategy: "priority", isActive: true, models: [{ kind: "model", providerId: "cc", model: "claude-opus", connectionId: "k1" }, "openai/gpt-5"] };
let lastPatch: unknown = null;
let server: http.Server;
let base = "";

before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    const auth = req.headers.authorization;
    const json = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (url.pathname === "/api/health") return json(200, { status: "ok", timestamp: "now" });
      if (auth === `Bearer ${INFER}`) return json(403, { error: { message: "Invalid management token" } });
      if (auth !== `Bearer ${MANAGE}`) return json(401, { error: "Invalid API key" });
      if (url.pathname === "/api/monitoring/health") return json(200, { status: "healthy", version: "3.8.54", system: { version: "3.8.54", buildSha: "abc" } });
      if (url.pathname === "/api/combos" && req.method === "GET") return json(200, { combos: [combo], total: 1 });
      if (url.pathname === "/api/combos/c1" && req.method === "GET") return json(200, combo);
      if (url.pathname === "/api/combos/c1" && req.method === "PATCH") {
        lastPatch = JSON.parse(raw);
        combo = { ...combo, ...(lastPatch as object) };
        return json(200, combo);
      }
      if (url.pathname === "/api/providers")
        return json(200, { connections: [{ id: "k1", provider: "cc", name: "Claude", isActive: true, apiKey: "sk-REAL-SECRET-REVEALED-0000000000", accessToken: "tok", providerSpecificData: { cookie: "c" } }], total: 1 });
      if (url.pathname === "/api/usage/call-logs") {
        assert.equal(url.searchParams.get("apiKey"), "LearnHarness");
        return json(200, [{ id: "r1", timestamp: "2026-11-20T10:00:00Z", status: 200, model: "claude-opus", requestedModel: "OmniRoute-Strong", provider: "cc", duration: 1234, tokens: { in: 10, out: 5 }, comboName: "OmniRoute-Strong", apiKeyName: "LearnHarness", resilienceActions: [{}, {}], requestBody: "PROMPT" }]);
      }
      if (url.pathname === "/api/usage/history") return json(200, { totalRequests: 3, byApiKey: { x: { apiKey: "sk-should-not-leak-000000000000" } } });
      if (url.pathname === "/api/stream") {
        res.writeHead(200, { "content-type": "text/event-stream" });
        return res.end("data: x\n\n");
      }
      json(404, { error: "nope" });
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const ac = new AbortController();
const client = (key = MANAGE) => new OmniRouteClient({ baseUrl: base, key, signal: ac.signal });

test("connection test: unreachable, no key, inference-only key, manage key", async () => {
  const down = await testConnection("http://127.0.0.1:1", MANAGE, ac.signal);
  assert.equal(down.reachable, false);
  const noKey = await testConnection(base, "", ac.signal);
  assert.equal(noKey.reachable, true);
  assert.equal(noKey.keyValid, false);
  const infer = await testConnection(base, INFER, ac.signal);
  assert.equal(infer.keyValid, false);
  assert.match(infer.detail, /manage/);
  const ok = await testConnection(base, MANAGE, ac.signal);
  assert.equal(ok.keyValid, true);
  assert.equal(ok.version, "3.8.54");
});

test("errors are classified in plain words", async () => {
  await assert.rejects(client("wrong-key-000000").getJson("/api/combos"), (e: OmniRouteError) => e.kind === "unauthorized");
  await assert.rejects(client(INFER).getJson("/api/combos"), (e: OmniRouteError) => e.kind === "forbidden" && /manage/.test(e.message));
  await assert.rejects(client().getJson("/api/missing"), (e: OmniRouteError) => e.kind === "not-found");
  await assert.rejects(client().getJson("/api/stream"), (e: OmniRouteError) => e.kind === "bad-response");
});

test("combo update keeps pinned steps and refuses stale edits", async () => {
  const c = client();
  const current = await getCombo(c, "c1");
  const fp = editableFingerprint(current);
  const { after } = await updateComboGuarded(c, "c1", fp, { models: ["openai/gpt-5", "cc/claude-opus"] });
  assert.deepEqual((lastPatch as { models: unknown[] }).models, ["openai/gpt-5", { kind: "model", providerId: "cc", model: "claude-opus", connectionId: "k1" }]);
  assert.equal(after.models[0], "openai/gpt-5");
  await assert.rejects(updateComboGuarded(c, "c1", fp, { strategy: "p2c" }), (e: OmniRouteError) => e.kind === "conflict");
});

test("connections never carry secrets", async () => {
  const list = await listConnections(client());
  assert.equal(JSON.stringify(list).includes("SECRET"), false);
  assert.equal(JSON.stringify(list).includes("cookie"), false);
  assert.equal(list[0]?.isActive, true);
});

test("call logs: filtered by LearnHarness's key name, mapped, no bodies", async () => {
  const rows = await callLogs(client(), { apiKey: "LearnHarness", limit: 10 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.comboName, "OmniRoute-Strong");
  assert.equal(rows[0]?.fallbackSteps, 2);
  assert.equal(rows[0]?.tokensIn, 10);
  assert.equal(JSON.stringify(rows).includes("PROMPT"), false);
});

test("explorer: redacts, refuses denied paths and unfilled path params", async () => {
  const data = (await explorerGet(client(), "/api/usage/history", {})) as Record<string, unknown>;
  assert.equal(JSON.stringify(data).includes("sk-should-not-leak"), false);
  await assert.rejects(explorerGet(client(), "/api/keys", {}), (e: OmniRouteError) => e.kind === "invalid-input");
  await assert.rejects(explorerGet(client(), "/api/combos/{id}", {}), (e: OmniRouteError) => e.kind === "invalid-input");
});
