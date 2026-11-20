// Real-process test of dist/watchdog.cjs with a fake `omniroute` CLI:
// the watchdog must stop OmniRoute when the followed parent PID dies, and on a stop request.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as net from "node:net";

const root = path.resolve(import.meta.dirname, "..");
const watchdog = path.join(root, "dist", "watchdog.cjs");

// Fake CLI: `serve --port P` runs an HTTP server and writes its PID; `stop --port P` kills it.
const FAKE = `
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const [cmd, , port] = process.argv.slice(2);
const pidFile = path.join(__dirname, "server-" + port + ".pid");
if (cmd === "serve") {
  http.createServer((q, s) => { s.writeHead(200, {"content-type":"application/json"}); s.end('{"status":"ok"}'); }).listen(Number(port), "127.0.0.1");
  fs.writeFileSync(pidFile, String(process.pid));
  process.on("SIGTERM", () => process.exit(0));
} else if (cmd === "stop") {
  try { process.kill(Number(fs.readFileSync(pidFile, "utf8"))); console.log("stopped"); } catch { console.log("nothing to stop"); }
}
`;

const freePort = () =>
  new Promise<number>((resolve) => {
    const s = net.createServer().listen(0, "127.0.0.1", () => {
      const p = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(p));
    });
  });
const healthy = async (port: number) => {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch {
    return false;
  }
};
const waitFor = async (fn: () => Promise<boolean> | boolean, ms = 15_000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
};
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

function setup() {
  if (!fs.existsSync(watchdog)) spawnSync(process.execPath, [path.join(root, "scripts", "build.mjs")], { stdio: "inherit" });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "orl-wd-"));
  const bin = path.join(dir, "omniroute.cjs");
  fs.writeFileSync(bin, FAKE);
  return { dir, bin };
}

test("watchdog stops OmniRoute when LearnHarness's server PID disappears", async () => {
  const { dir, bin } = setup();
  const port = await freePort();
  // Stand-in for the LearnHarness server process.
  const parent = spawn(process.execPath, ["-e", "setInterval(()=>{}, 1000)"], { stdio: "ignore" });
  const cfg = { nodePath: process.execPath, omnirouteBin: bin, port, parentPid: parent.pid, logFile: path.join(dir, "log"), stateFile: path.join(dir, "state.json"), stopFile: path.join(dir, "stop") };
  const wd = spawn(process.execPath, [watchdog], { env: { ...process.env, OMNIROUTE_LH_WATCHDOG: JSON.stringify(cfg) }, detached: true, stdio: "ignore" });
  wd.unref();
  try {
    assert.ok(await waitFor(() => healthy(port)), "OmniRoute came up");
    const state = JSON.parse(fs.readFileSync(cfg.stateFile, "utf8")) as { watchdogPid: number; childPid: number };
    assert.equal(state.watchdogPid, wd.pid);
    parent.kill("SIGKILL"); // like Windows terminating LearnHarness: no cleanup runs
    assert.ok(await waitFor(async () => !(await healthy(port))), "OmniRoute stopped after the parent died");
    assert.ok(await waitFor(() => !alive(wd.pid!)), "watchdog exited");
    assert.match(fs.readFileSync(cfg.logFile, "utf8"), /LearnHarness closed/);
  } finally {
    parent.kill("SIGKILL");
    if (alive(wd.pid!)) process.kill(wd.pid!);
  }
});

test("watchdog stops OmniRoute on a stop request and keeps running without a parent", async () => {
  const { dir, bin } = setup();
  const port = await freePort();
  const cfg = { nodePath: process.execPath, omnirouteBin: bin, port, parentPid: null, logFile: path.join(dir, "log"), stateFile: path.join(dir, "state.json"), stopFile: path.join(dir, "stop") };
  const wd = spawn(process.execPath, [watchdog], { env: { ...process.env, OMNIROUTE_LH_WATCHDOG: JSON.stringify(cfg) }, detached: true, stdio: "ignore" });
  wd.unref();
  try {
    assert.ok(await waitFor(() => healthy(port)));
    await new Promise((r) => setTimeout(r, 2500));
    assert.ok(await healthy(port), "still running: keep-running mode follows no parent");
    fs.writeFileSync(cfg.stopFile, "now");
    assert.ok(await waitFor(async () => !(await healthy(port))), "stopped on request");
    const state = JSON.parse(fs.readFileSync(cfg.stateFile, "utf8")) as { state: string };
    assert.equal(state.state, "stopped");
  } finally {
    if (alive(wd.pid!)) process.kill(wd.pid!);
  }
});
