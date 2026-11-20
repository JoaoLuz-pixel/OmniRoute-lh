// Locating the system Node/npm and the plugin-owned runtime folder (decision 8).
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export const IS_WIN = process.platform === "win32";

/** Plugin-owned folder outside LearnHarness data, so Device Sync never copies it. */
export function runtimeRoot(env: NodeJS.ProcessEnv = process.env): string {
  if (IS_WIN) return path.join(env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "omniroute-lh", "runtime");
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support", "omniroute-lh", "runtime");
  return path.join(env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "omniroute-lh", "runtime");
}

export const OMNIROUTE_ENGINES = { min22: [22, 22, 2] as const, min24: [24, 0, 0] as const, maxExclusive: 27 };

export function parseVersion(v: string): [number, number, number] | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

const cmp = (a: readonly number[], b: readonly number[]) => {
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0);
  return 0;
};

/** OmniRoute 3.8.x engines: ">=22.22.2 <23 || >=24.0.0 <27". */
export function nodeSatisfiesOmniRoute(version: string): boolean {
  const v = parseVersion(version);
  if (!v) return false;
  if (v[0] === 22) return cmp(v, OMNIROUTE_ENGINES.min22) >= 0;
  return cmp(v, OMNIROUTE_ENGINES.min24) >= 0 && v[0] < OMNIROUTE_ENGINES.maxExclusive;
}

export interface NodeInfo {
  nodePath: string;
  version: string;
  npmCli: string | null;
}

function run(cmd: string, args: string[], timeout = 15_000) {
  return spawnSync(cmd, args, { encoding: "utf8", timeout, windowsHide: true, env: cleanEnv() });
}

/** Process env without LearnHarness/Electron-specific variables. */
export function cleanEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.NODE_OPTIONS;
  for (const k of Object.keys(env)) if (k.startsWith("LH_") || k.startsWith("LEARNHARNESS_")) delete env[k];
  return { ...env, ...extra };
}

function candidates(): string[] {
  const out: string[] = [];
  const override = process.env.OMNIROUTE_LH_NODE;
  if (override) out.push(override);
  const finder = IS_WIN ? run("where", ["node"]) : run("which", ["-a", "node"]);
  if (finder.status === 0) out.push(...finder.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  if (IS_WIN) out.push(path.join(process.env.ProgramFiles || "C:\\Program Files", "nodejs", "node.exe"));
  else out.push("/usr/local/bin/node", "/usr/bin/node", "/opt/homebrew/bin/node");
  return [...new Set(out)];
}

function npmCliNear(nodePath: string): string | null {
  const dir = path.dirname(nodePath);
  for (const p of [
    path.join(dir, "node_modules", "npm", "bin", "npm-cli.js"), // Windows installer layout
    path.join(dir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"), // Unix prefix layout
  ]) {
    if (fs.existsSync(p)) return path.resolve(p);
  }
  return null;
}

/**
 * Find a system Node that can run OmniRoute. Never returns LearnHarness's own
 * runtime (Electron): OmniRoute's native modules are built for the system Node ABI.
 */
export function findSystemNode(): { found: NodeInfo | null; rejected: string[] } {
  const rejected: string[] = [];
  for (const p of candidates()) {
    if (!fs.existsSync(p)) continue;
    if (path.resolve(p) === path.resolve(process.execPath)) continue;
    const r = run(p, ["-p", "process.versions.node + ' ' + (process.versions.electron || '')"]);
    if (r.status !== 0) continue;
    const [version = "", electron = ""] = r.stdout.trim().split(" ");
    if (electron) continue;
    if (!nodeSatisfiesOmniRoute(version)) {
      rejected.push(`${p} (Node ${version})`);
      continue;
    }
    return { found: { nodePath: p, version, npmCli: npmCliNear(p) }, rejected };
  }
  return { found: null, rejected };
}

/** Where `omniroute` lives inside an npm prefix. */
export function omnirouteBinIn(prefix: string): string {
  return path.join(prefix, "node_modules", "omniroute", "bin", "omniroute.mjs");
}

export function installedVersion(prefix: string): string | null {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(prefix, "node_modules", "omniroute", "package.json"), "utf8")) as { version?: unknown };
    return typeof pkg.version === "string" ? pkg.version : null;
  } catch {
    return null;
  }
}

export function isPidAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}
