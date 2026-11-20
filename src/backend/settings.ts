// Plugin settings, including secrets (decision 2: plugin data folder, mode 600).
// Secrets never leave the server part; toPublic() masks them.
import * as path from "node:path";
import { readVersioned, writeJsonAtomic } from "./store.ts";
import type { PublicSettings, RunMode, SettingsPatch } from "../shared/protocol.ts";

export const SETTINGS_VERSION = 1;
export const DEFAULT_PORT = 20128;

export interface Settings {
  version: 1;
  mode: RunMode;
  /** Base URL without trailing slash and without /v1, e.g. http://127.0.0.1:20128 */
  baseUrl: string;
  port: number;
  managementKey: string;
  inferenceKey: string;
  inferenceKeyName: string;
  refreshSeconds: number;
  keepRunningAfterClose: boolean;
  dashboardPassword: string;
}

export function defaultSettings(): Settings {
  return {
    version: 1,
    mode: "managed",
    baseUrl: `http://127.0.0.1:${DEFAULT_PORT}`,
    port: DEFAULT_PORT,
    managementKey: "",
    inferenceKey: "",
    inferenceKeyName: "LearnHarness",
    refreshSeconds: 30,
    keepRunningAfterClose: false,
    dashboardPassword: "",
  };
}

const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);

function migrate(raw: Record<string, unknown>): Settings {
  const d = defaultSettings();
  return {
    version: 1,
    mode: raw.mode === "external" ? "external" : "managed",
    baseUrl: str(raw.baseUrl, d.baseUrl),
    port: num(raw.port, d.port),
    managementKey: str(raw.managementKey, ""),
    inferenceKey: str(raw.inferenceKey, ""),
    inferenceKeyName: str(raw.inferenceKeyName, d.inferenceKeyName),
    refreshSeconds: num(raw.refreshSeconds, d.refreshSeconds),
    keepRunningAfterClose: bool(raw.keepRunningAfterClose, false),
    dashboardPassword: str(raw.dashboardPassword, ""),
  };
}

export function mask(secret: string): string {
  if (!secret) return "";
  return secret.length <= 8 ? "…" : `…${secret.slice(-4)}`;
}

export function toPublic(s: Settings): PublicSettings {
  return {
    mode: s.mode,
    baseUrl: s.baseUrl,
    port: s.port,
    managementKeyHint: mask(s.managementKey),
    inferenceKeyHint: mask(s.inferenceKey),
    inferenceKeyName: s.inferenceKeyName,
    refreshSeconds: s.refreshSeconds,
    keepRunningAfterClose: s.keepRunningAfterClose,
    dashboardPasswordSet: s.dashboardPassword.length > 0,
  };
}

/** Normalise and validate a base URL. Returns an error message or the clean URL. */
export function normaliseBaseUrl(input: string): { ok: true; url: string } | { ok: false; message: string } {
  const trimmed = input.trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, message: "Enter a full address such as http://127.0.0.1:20128" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, message: "The address must start with http:// or https://" };
  if (url.username || url.password) return { ok: false, message: "Don't put credentials in the address; use the key fields." };
  if (url.search || url.hash) return { ok: false, message: "The address must not contain ? or #" };
  return { ok: true, url: `${url.protocol}//${url.host}${url.pathname === "/" ? "" : url.pathname}` };
}

const KEY_RE = /^[\x21-\x7e]{8,512}$/;

/** Apply a patch from the browser part. Every field is validated here (BRIEF 4.1). */
export function applyPatch(current: Settings, patch: SettingsPatch): { ok: true; settings: Settings } | { ok: false; message: string } {
  if (!patch || typeof patch !== "object") return { ok: false, message: "Invalid settings" };
  const next: Settings = { ...current };
  if (patch.mode !== undefined) {
    if (patch.mode !== "managed" && patch.mode !== "external") return { ok: false, message: "Unknown mode" };
    next.mode = patch.mode;
  }
  if (patch.baseUrl !== undefined) {
    if (typeof patch.baseUrl !== "string") return { ok: false, message: "Invalid address" };
    const r = normaliseBaseUrl(patch.baseUrl);
    if (!r.ok) return r;
    next.baseUrl = r.url;
  }
  if (patch.port !== undefined) {
    if (!Number.isInteger(patch.port) || patch.port < 1024 || patch.port > 65535) return { ok: false, message: "Port must be between 1024 and 65535" };
    next.port = patch.port;
    if (next.mode === "managed") next.baseUrl = `http://127.0.0.1:${patch.port}`;
  }
  for (const field of ["managementKey", "inferenceKey"] as const) {
    const value = patch[field];
    if (value === undefined) continue;
    if (typeof value !== "string") return { ok: false, message: "Invalid key" };
    const v = value.trim();
    if (v && !KEY_RE.test(v)) return { ok: false, message: "That doesn't look like an OmniRoute key (no spaces, 8–512 characters)." };
    next[field] = v;
  }
  if (patch.inferenceKeyName !== undefined) {
    if (typeof patch.inferenceKeyName !== "string" || patch.inferenceKeyName.length > 200) return { ok: false, message: "Invalid key name" };
    next.inferenceKeyName = patch.inferenceKeyName.trim();
  }
  if (patch.refreshSeconds !== undefined) {
    if (!Number.isInteger(patch.refreshSeconds) || patch.refreshSeconds < 5 || patch.refreshSeconds > 3600) return { ok: false, message: "Refresh interval must be 5–3600 seconds" };
    next.refreshSeconds = patch.refreshSeconds;
  }
  if (patch.keepRunningAfterClose !== undefined) {
    if (typeof patch.keepRunningAfterClose !== "boolean") return { ok: false, message: "Invalid option" };
    next.keepRunningAfterClose = patch.keepRunningAfterClose;
  }
  return { ok: true, settings: next };
}

export class SettingsStore {
  readonly file: string;
  private cached: Settings | null = null;
  constructor(dataDirectory: string) {
    this.file = path.join(dataDirectory, "settings.json");
  }
  get(): Settings {
    if (!this.cached) this.cached = readVersioned(this.file, SETTINGS_VERSION, defaultSettings, migrate);
    return this.cached;
  }
  save(next: Settings): void {
    writeJsonAtomic(this.file, next);
    this.cached = next;
  }
}
