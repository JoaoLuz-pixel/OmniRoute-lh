// Watchdog for a plugin-started OmniRoute (BRIEF 4.8). Built to dist/watchdog.cjs
// and run with the *system* Node, detached from LearnHarness.
//
// Why it exists: on Windows, LearnHarness's server is terminated without running
// plugin cleanup, and Windows doesn't kill orphaned children. This process watches
// the LearnHarness server PID and stops OmniRoute (`omniroute stop`) when it's gone.
//
// Config comes from the OMNIROUTE_LH_WATCHDOG env var (JSON) so nothing sensitive
// is visible on the command line; OmniRoute's secrets arrive in the env as well.
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

interface WatchdogConfig {
  nodePath: string;
  omnirouteBin: string;
  port: number;
  /** LearnHarness server PID to follow; null = keep running after LearnHarness closes. */
  parentPid: number | null;
  logFile: string;
  stateFile: string;
  stopFile: string;
}

const config = JSON.parse(process.env.OMNIROUTE_LH_WATCHDOG ?? "null") as WatchdogConfig | null;
if (!config) {
  console.error("watchdog: missing OMNIROUTE_LH_WATCHDOG");
  process.exit(2);
}
const cfg: WatchdogConfig = config;

// Loopback only: OmniRoute otherwise listens on 0.0.0.0 with no API key required.
// INITIAL_PASSWORD (if set by the plugin) arrives in process.env and overrides the
// package's shipped default (CHANGEME); it only applies while no password is saved yet.
const childEnv: NodeJS.ProcessEnv = { ...process.env, PORT: String(cfg.port), OMNIROUTE_SERVER_HOST: "127.0.0.1" };
delete childEnv.OMNIROUTE_LH_WATCHDOG;
delete childEnv.ELECTRON_RUN_AS_NODE;

const MAX_LOG = 5 * 1024 * 1024;
function log(line: string): void {
  try {
    const st = fs.statSync(cfg.logFile, { throwIfNoEntry: false });
    if (st && st.size > MAX_LOG) fs.renameSync(cfg.logFile, cfg.logFile + ".1");
    fs.appendFileSync(cfg.logFile, line.endsWith("\n") ? line : line + "\n");
  } catch {
    /* logging must never kill the watchdog */
  }
}

function writeState(state: Record<string, unknown>): void {
  try {
    const tmp = `${cfg.stateFile}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ version: 1, watchdogPid: process.pid, port: cfg.port, ...state }, null, 2));
    fs.renameSync(tmp, cfg.stateFile);
  } catch {
    /* ignore */
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

fs.mkdirSync(path.dirname(cfg.logFile), { recursive: true });
try {
  fs.rmSync(cfg.stopFile, { force: true });
} catch {
  /* ignore */
}

const startedAt = new Date().toISOString();
log(`--- ${startedAt} watchdog ${process.pid} starting OmniRoute on port ${cfg.port} (follows LearnHarness PID ${cfg.parentPid ?? "none"})`);

const child: ChildProcess = spawn(cfg.nodePath, [cfg.omnirouteBin, "serve", "--port", String(cfg.port), "--no-open"], {
  env: childEnv,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
child.stdout?.on("data", (b: Buffer) => log(b.toString("utf8")));
child.stderr?.on("data", (b: Buffer) => log(b.toString("utf8")));
writeState({ state: "starting", childPid: child.pid ?? null, startedAt });

let stopping = false;
function stopOmniRoute(reason: string): void {
  if (stopping) return;
  stopping = true;
  log(`--- ${new Date().toISOString()} stopping OmniRoute: ${reason}`);
  writeState({ state: "stopping", childPid: child.pid ?? null, startedAt, reason });
  const r = spawnSync(cfg.nodePath, [cfg.omnirouteBin, "stop", "--port", String(cfg.port)], {
    env: childEnv,
    encoding: "utf8",
    timeout: 20_000,
    windowsHide: true,
  });
  if (r.stdout) log(r.stdout);
  if (r.stderr) log(r.stderr);
  if (child.pid && alive(child.pid)) {
    try {
      child.kill();
    } catch {
      /* already gone */
    }
  }
}

child.on("exit", (code, signal) => {
  const state = stopping ? "stopped" : "crashed";
  log(`--- ${new Date().toISOString()} OmniRoute exited (code ${code ?? "-"}, signal ${signal ?? "-"})`);
  writeState({ state, childPid: null, startedAt, exitCode: code, exitSignal: signal, exitedAt: new Date().toISOString() });
  clearInterval(timer);
  process.exit(0);
});
child.on("error", (err) => {
  log(`--- failed to start OmniRoute: ${err.message}`);
  writeState({ state: "crashed", childPid: null, startedAt, error: err.message });
  process.exit(1);
});

const timer = setInterval(() => {
  if (stopping) return;
  if (fs.existsSync(cfg.stopFile)) return stopOmniRoute("requested by the plugin");
  if (cfg.parentPid !== null && !alive(cfg.parentPid)) return stopOmniRoute("LearnHarness closed");
}, 2000);

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) process.on(sig, () => stopOmniRoute(`watchdog received ${sig}`));
