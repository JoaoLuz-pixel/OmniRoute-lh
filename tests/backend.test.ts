// Activate the built dist/backend.cjs with a fake LearnHarness host context.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");

function fakeHost() {
  const handlers = new Map<string, (input: unknown) => unknown>();
  const emitted: { topic: string; data?: unknown }[] = [];
  const cleanups: (() => unknown)[] = [];
  const listeners: ((e: { type: string; chatId?: string }) => void)[] = [];
  const ac = new AbortController();
  const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "orl-data-"));
  const ctx = {
    manifest: JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8")),
    directory: path.join(root, "dist"),
    dataDirectory,
    signal: ac.signal,
    cleanup: (fn: () => unknown) => cleanups.push(fn),
    handle: (name: string, fn: (input: unknown) => unknown) => {
      assert.ok(!handlers.has(name), `duplicate handler ${name}`);
      handlers.set(name, fn);
      return () => handlers.delete(name);
    },
    events: { on: (l: (e: { type: string }) => void) => (listeners.push(l), () => undefined), emit: (topic: string, data?: unknown) => emitted.push({ topic, data }) },
    inference: {
      catalog: async () => ({
        models: [],
        defaults: null,
        providers: [],
        slots: { strong: { model: { provider: "anthropic", id: "claude-opus" } }, cheap: null, vision: null },
        rolePins: { researcher: null, demoBuilder: null, visualMaker: null, extractor: null, auditor: null, sideQuestion: null },
      }),
    },
    learning: { getSession: (id: string) => (id === "chat1" ? { settings: { model: { provider: "openai", id: "gpt-5" } } } : null), listSessions: () => [] },
  };
  return { ctx, handlers, emitted, cleanups, listeners, ac, dataDirectory };
}

const call = async (h: Map<string, (i: unknown) => unknown>, name: string, input: unknown = {}) => {
  const fn = h.get(name);
  assert.ok(fn, `handler ${name} registered`);
  return (await fn(input)) as { ok: boolean; value?: any; error?: { kind: string; message: string } };
};

test("backend activates, validates settings, never returns the key, tracks bypassing chats", async () => {
  const mod = require(path.join(root, "dist", "backend.cjs")) as { activate: (ctx: unknown) => Promise<void> };
  const host = fakeHost();
  await mod.activate(host.ctx);
  for (const name of ["settings.get", "settings.save", "connection.test", "runtime.status", "setup.state", "combos.list", "combos.update", "callLogs", "explorer.spec", "explorer.get", "changes.list", "changes.revert", "manual.status"]) assert.ok(host.handlers.has(name), name);

  // External mode against a closed port: nothing is started.
  let r = await call(host.handlers, "settings.save", { mode: "external", baseUrl: "http://127.0.0.1:9/" });
  assert.equal(r.ok, true);
  r = await call(host.handlers, "settings.save", { managementKey: "bad key" });
  assert.equal(r.ok, false);
  assert.equal(r.error?.kind, "invalid-input");
  r = await call(host.handlers, "settings.save", { managementKey: "om-SECRET-manage-key-000" });
  assert.equal(r.ok, true);
  const got = await call(host.handlers, "settings.get");
  assert.equal(got.ok, true);
  assert.equal(JSON.stringify(got.value).includes("om-SECRET"), false, "key never sent back");
  assert.equal(got.value.settings.managementKeyHint, "…-000");
  assert.equal(got.value.runtime.state, "external");
  const onDisk = fs.readFileSync(path.join(host.dataDirectory, "settings.json"), "utf8");
  assert.match(onDisk, /"version": 1/);
  if (process.platform !== "win32") assert.equal(fs.statSync(path.join(host.dataDirectory, "settings.json")).mode & 0o777, 0o600);

  // Manual step reported as pending (strong still on anthropic).
  const manual = await call(host.handlers, "manual.status");
  assert.equal(manual.value.complete, false);
  assert.equal(manual.value.pending[0].expected, "custom/OmniRoute-Strong");

  // turn-settled on a chat with its own model → listed as bypassing.
  for (const l of host.listeners) l({ type: "turn-settled", chatId: "chat1" });
  const manual2 = await call(host.handlers, "manual.status");
  assert.deepEqual(manual2.value.bypassingChats, [{ chatId: "chat1", model: "openai/gpt-5" }]);
  assert.ok(host.emitted.some((e) => e.topic === "turn-settled"));

  // OmniRoute unreachable → plain-language error, not a crash.
  const logs = await call(host.handlers, "combos.list");
  assert.equal(logs.ok, false);
  assert.equal(logs.error?.kind, "unreachable");

  host.ac.abort();
  for (const c of host.cleanups) await c();
});
