// Managed OmniRoute: install / start / stop / status (BRIEF 4.8, decision 8).
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { RuntimeState, RuntimeStatus } from "../shared/protocol.ts";
import { OmniRouteClient } from "./omniroute.ts";
import type { Settings } from "./settings.ts";
import { cleanEnv, findSystemNode, installedVersion, isPidAlive, omnirouteBinIn, runtimeRoot, type NodeInfo } from "./system.ts";

/** Install scripts npm 11 blocks by default; omniroute's postinstall is required on Windows. */
export const ALLOW_SCRIPTS = ["omniroute", "keytar", "onnxruntime-node", "@parcel/watcher", "@swc/core", "protobufjs", "esbuild", "better-sqlite3"];

interface WatchdogState {
  version: 1;
  watchdogPid: number;
  port: number;
  state: "starting" | "stopping" | "stopped" | "crashed";
  childPid: number | null;
  startedAt: string;
  exitCode?: number | null;
  error?: string;
}

export interface RuntimeDeps {
  dataDirectory: string;
  /** Plugin code directory (dist/), where watchdog.cjs lives. */
  codeDirectory: string;
  signal: AbortSignal;
  getSettings: () => Settings;
  /** Live progress lines to the browser part (install log, start/stop). */
  emit: (line: string) => void;
}

export class RuntimeManager {
  private state: RuntimeState = "stopped";
  private ownedByPlugin = false;
  private version: string | null = null;
  private lastError: string | null = null;
  private node: NodeInfo | null = null;
  private busy: Promise<unknown> | null = null;

  constructor(private readonly deps: RuntimeDeps) {}

  private get files() {
    const dir = path.join(this.deps.dataDirectory, "runtime");
    return {
      dir,
      log: path.join(dir, "omniroute.log"),
      state: path.join(dir, "watchdog.json"),
      stop: path.join(dir, "stop.request"),
    };
  }

  /**
   * The plugin-owned install (decision 8). A global `npm i -g omniroute` is deliberately
   * not reused: under npm 11 it is often missing its postinstall (native modules), and
   * the plugin can't control its version.
   */
  installPrefix(): { prefix: string; kind: "plugin" } | null {
    const own = runtimeRoot();
    return fs.existsSync(omnirouteBinIn(own)) ? { prefix: own, kind: "plugin" } : null;
  }

  private binFor(install: { prefix: string }): string {
    return omnirouteBinIn(install.prefix);
  }

  private systemNode(): NodeInfo | null {
    if (!this.node) this.node = findSystemNode().found;
    return this.node;
  }

  private readWatchdog(): WatchdogState | null {
    try {
      const s = JSON.parse(fs.readFileSync(this.files.state, "utf8")) as WatchdogState;
      return s && typeof s.watchdogPid === "number" ? s : null;
    } catch {
      return null;
    }
  }

  private client(): OmniRouteClient {
    const s = this.deps.getSettings();
    return new OmniRouteClient({ baseUrl: s.baseUrl, key: "", signal: this.deps.signal, timeoutMs: 2500 });
  }

  async isHealthy(): Promise<boolean> {
    try {
      const r = await this.client().request("/api/health", { anonymous: true });
      return (r.body as { status?: unknown } | null)?.status === "ok";
    } catch {
      return false;
    }
  }

  logTail(lines = 40): string[] {
    try {
      const text = fs.readFileSync(this.files.log, "utf8");
      return text.split(/\r?\n/).filter(Boolean).slice(-lines);
    } catch {
      return [];
    }
  }

  async status(): Promise<RuntimeStatus> {
    const s = this.deps.getSettings();
    const install = s.mode === "managed" ? this.installPrefix() : null;
    const wd = this.readWatchdog();
    const healthy = await this.isHealthy();
    let state: RuntimeState = this.state;
    if (s.mode === "external") state = "external";
    else if (this.state === "installing" || this.state === "stopping") state = this.state;
    else if (healthy) state = "running";
    else if (wd && isPidAlive(wd.watchdogPid) && wd.state === "starting") state = "starting";
    else if (wd?.state === "crashed") state = "crashed";
    else if (!install) state = "not-installed";
    else state = "stopped";
    this.ownedByPlugin = healthy && !!wd && isPidAlive(wd.watchdogPid);
    return {
      mode: s.mode,
      state,
      ownedByPlugin: this.ownedByPlugin,
      version: this.version ?? (install ? installedVersion(install.prefix) : null),
      pid: wd?.childPid ?? null,
      port: s.port,
      installDir: install?.prefix ?? null,
      nodePath: this.systemNode()?.nodePath ?? null,
      lastError: this.lastError ?? (wd?.state === "crashed" ? `OmniRoute exited (code ${wd.exitCode ?? "?"})${wd.error ? `: ${wd.error}` : ""}` : null),
      logTail: this.logTail(),
    };
  }

  private exclusive<T>(fn: () => Promise<T>): Promise<T> {
    if (this.busy) throw new Error("Another OmniRoute operation is still running.");
    const p = fn().finally(() => {
      this.busy = null;
    });
    this.busy = p;
    return p;
  }

  /** Install OmniRoute into the plugin-owned folder (only after the user confirms). */
  install(version = "latest"): Promise<void> {
    return this.exclusive(async () => {
      if (!/^(latest|\d+\.\d+\.\d+)$/.test(version)) throw new Error("Invalid version");
      const node = this.systemNode();
      if (!node) {
        const { rejected } = findSystemNode();
        throw new Error(
          rejected.length
            ? `Found Node.js, but OmniRoute needs Node 22.22.2+ (22.x) or 24–26: ${rejected.join(", ")}. Install a supported Node from https://nodejs.org and restart LearnHarness.`
            : "Node.js isn't installed (OmniRoute runs on Node 22.22.2+ or 24–26). Install it from https://nodejs.org and restart LearnHarness."
        );
      }
      if (!node.npmCli) throw new Error(`Found Node at ${node.nodePath}, but not npm next to it. Reinstall Node.js from https://nodejs.org.`);
      const prefix = runtimeRoot();
      fs.mkdirSync(prefix, { recursive: true });
      if (!fs.existsSync(path.join(prefix, "package.json"))) {
        fs.writeFileSync(path.join(prefix, "package.json"), JSON.stringify({ name: "omniroute-lh-runtime", private: true }, null, 2));
      }
      this.state = "installing";
      this.lastError = null;
      this.deps.emit(`Installing omniroute@${version} into ${prefix} (this takes a few minutes)…`);
      try {
        await this.runNpm(node, prefix, ["install", `omniroute@${version}`, "--no-audit", "--no-fund", "--omit=dev", `--allow-scripts=${ALLOW_SCRIPTS.join(",")}`]);
        // npm may still report packages whose scripts weren't covered; rebuild those explicitly.
        const pending = await this.uncoveredScripts(node, prefix);
        if (pending.length) {
          this.deps.emit(`Running blocked install scripts: ${pending.join(", ")}`);
          await this.runNpm(node, prefix, ["rebuild", ...pending, `--allow-scripts=${pending.join(",")}`]);
        }
        const v = installedVersion(prefix);
        if (!v) throw new Error("npm finished but OmniRoute isn't in the install folder.");
        this.version = v;
        this.deps.emit(`Installed OmniRoute ${v}. Checking it with "omniroute doctor"…`);
        await this.runNode(node, [omnirouteBinIn(prefix), "doctor"], 120_000).catch((e: Error) => this.deps.emit(`doctor: ${e.message}`));
        this.state = "installed";
      } catch (error) {
        this.state = "not-installed";
        this.lastError = (error as Error).message;
        throw error;
      }
    });
  }

  private async uncoveredScripts(node: NodeInfo, prefix: string): Promise<string[]> {
    let out = "";
    try {
      out = await this.runNpm(node, prefix, ["install-scripts", "ls"], 60_000, true);
    } catch {
      return []; // older npm without install-scripts: scripts already ran
    }
    const names: string[] = [];
    for (const m of out.matchAll(/^\s+(@?[a-z0-9._/-]+)@\d[^\s]*\s+\((?:pre|post)?install/gim)) if (m[1]) names.push(m[1]);
    return [...new Set(names)].filter((n) => n !== "@google/genai");
  }

  private runNpm(node: NodeInfo, prefix: string, args: string[], timeoutMs = 15 * 60_000, quiet = false): Promise<string> {
    return this.runNode(node, [node.npmCli!, "--prefix", prefix, ...args], timeoutMs, quiet);
  }

  private runNode(node: NodeInfo, args: string[], timeoutMs: number, quiet = false): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(node.nodePath, args, { env: cleanEnv(), windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      let out = "";
      const onLine = (b: Buffer) => {
        const text = b.toString("utf8");
        out += text;
        if (!quiet) for (const line of text.split(/\r?\n/)) if (line.trim()) this.deps.emit(line.slice(0, 500));
      };
      child.stdout.on("data", onLine);
      child.stderr.on("data", onLine);
      const timer = setTimeout(() => child.kill(), timeoutMs);
      const abort = () => child.kill();
      this.deps.signal.addEventListener("abort", abort, { once: true });
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
      child.on("exit", (code) => {
        clearTimeout(timer);
        this.deps.signal.removeEventListener("abort", abort);
        if (code === 0) resolve(out);
        else reject(new Error(`${path.basename(args[0] ?? "node")} ${args[1] ?? ""} failed (exit ${code}). ${out.split(/\r?\n/).filter(Boolean).slice(-3).join(" ")}`.trim()));
      });
    });
  }

  /** Start OmniRoute through the watchdog. No-op if something already answers on the address. */
  start(): Promise<"started" | "already-running"> {
    return this.exclusive(async () => {
      if (await this.isHealthy()) return "already-running" as const;
      const s = this.deps.getSettings();
      const install = this.installPrefix();
      if (!install) throw new Error("OmniRoute isn't installed yet. Use the set-up guide to install it.");
      const node = this.systemNode();
      if (!node) throw new Error("No suitable Node.js found to run OmniRoute.");
      const watchdog = path.join(this.deps.codeDirectory, "watchdog.cjs");
      if (!fs.existsSync(watchdog)) throw new Error("watchdog.cjs is missing from the plugin package; reinstall the plugin.");
      fs.mkdirSync(this.files.dir, { recursive: true });
      fs.rmSync(this.files.state, { force: true });
      this.state = "starting";
      this.lastError = null;
      const cfg = {
        nodePath: node.nodePath,
        omnirouteBin: this.binFor(install),
        port: s.port,
        parentPid: s.keepRunningAfterClose ? null : process.pid,
        logFile: this.files.log,
        stateFile: this.files.state,
        stopFile: this.files.stop,
      };
      const child = spawn(node.nodePath, [watchdog], {
        env: cleanEnv({ OMNIROUTE_LH_WATCHDOG: JSON.stringify(cfg) }),
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
      this.deps.emit(`Starting OmniRoute on port ${s.port}…`);
      const deadline = Date.now() + 90_000;
      while (Date.now() < deadline) {
        if (this.deps.signal.aborted) throw new Error("The plugin was stopped.");
        if (await this.isHealthy()) {
          this.state = "running";
          this.ownedByPlugin = true;
          this.deps.emit("OmniRoute is running.");
          return "started" as const;
        }
        const wd = this.readWatchdog();
        if (wd?.state === "crashed") break;
        await new Promise((r) => setTimeout(r, 1000));
      }
      this.state = "crashed";
      this.lastError = `OmniRoute didn't start. Last log lines:\n${this.logTail(8).join("\n")}`;
      throw new Error(this.lastError);
    });
  }

  /** Stop OmniRoute, but only one this plugin started. */
  stop(reason = "requested"): Promise<"stopped" | "not-owned"> {
    return this.exclusive(async () => {
      const wd = this.readWatchdog();
      if (!wd || !isPidAlive(wd.watchdogPid)) return "not-owned" as const;
      this.state = "stopping";
      this.deps.emit(`Stopping OmniRoute (${reason})…`);
      fs.writeFileSync(this.files.stop, new Date().toISOString());
      const deadline = Date.now() + 30_000;
      while (Date.now() < deadline && isPidAlive(wd.watchdogPid)) await new Promise((r) => setTimeout(r, 500));
      if (isPidAlive(wd.watchdogPid)) {
        try {
          process.kill(wd.watchdogPid);
        } catch {
          /* gone */
        }
      }
      this.state = "stopped";
      this.ownedByPlugin = false;
      this.deps.emit("OmniRoute stopped.");
      return "stopped" as const;
    });
  }

  /** Server activation: in managed mode, start OmniRoute unless one is already running. */
  async onActivate(): Promise<void> {
    const s = this.deps.getSettings();
    if (s.mode !== "managed") return;
    if (await this.isHealthy()) {
      const wd = this.readWatchdog();
      this.ownedByPlugin = !!wd && isPidAlive(wd.watchdogPid);
      this.state = "running";
      return;
    }
    if (!this.installPrefix()) {
      this.state = "not-installed";
      return;
    }
    await this.start().catch((e: Error) => {
      this.lastError = e.message;
    });
  }

  /** Plugin disable / clean shutdown. The watchdog covers the cases where this never runs. */
  async onCleanup(): Promise<void> {
    const s = this.deps.getSettings();
    if (s.mode !== "managed" || s.keepRunningAfterClose) return;
    const wd = this.readWatchdog();
    if (wd && isPidAlive(wd.watchdogPid)) {
      try {
        fs.writeFileSync(this.files.stop, new Date().toISOString());
      } catch {
        /* data dir gone */
      }
    }
  }
}
