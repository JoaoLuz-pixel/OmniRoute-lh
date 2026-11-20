// Shapes exchanged between the browser part and the server part over ctx.call.
// Everything here is JSON. Secrets never appear in these types: the server part
// only ever sends masked hints ("…a1b2") to the browser.

export const PLUGIN_ID = "omniroute-lh";
export const VIEW_ID = "omniroute";

export type RunMode = "managed" | "external";

/** LearnHarness model slots and background roles that get plugin-owned combos. */
export const SLOTS = ["strong", "cheap", "vision"] as const;
export type Slot = (typeof SLOTS)[number];
export const ROLES = ["researcher", "demoBuilder", "visualMaker", "extractor", "auditor", "sideQuestion"] as const;
export type Role = (typeof ROLES)[number];
export type Target = Slot | Role;

/** Combo name per target (decision 5b). */
export const COMBO_NAMES: Record<Target, string> = {
  strong: "OmniRoute-Strong",
  cheap: "OmniRoute-Cheap",
  vision: "OmniRoute-Vision",
  researcher: "OmniRoute-Researcher",
  demoBuilder: "OmniRoute-DemoBuilder",
  visualMaker: "OmniRoute-VisualMaker",
  extractor: "OmniRoute-Extractor",
  auditor: "OmniRoute-Auditor",
  sideQuestion: "OmniRoute-SideQuestion",
};

/** LearnHarness's built-in Custom endpoint provider id (auth-keys CUSTOM_PROVIDER, v0.6.1). */
export const LH_CUSTOM_PROVIDER = "custom";

export interface PublicSettings {
  mode: RunMode;
  baseUrl: string;
  port: number;
  /** "…a1b2" or "" when unset. */
  managementKeyHint: string;
  inferenceKeyHint: string;
  inferenceKeyName: string;
  refreshSeconds: number;
  keepRunningAfterClose: boolean;
  dashboardPasswordSet: boolean;
}

export interface SettingsPatch {
  mode?: RunMode;
  baseUrl?: string;
  port?: number;
  /** Empty string clears; undefined leaves unchanged. */
  managementKey?: string;
  inferenceKey?: string;
  inferenceKeyName?: string;
  refreshSeconds?: number;
  keepRunningAfterClose?: boolean;
}

export type ErrorKind =
  | "unreachable"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "bad-response"
  | "http"
  | "not-configured"
  | "invalid-input"
  | "conflict"
  | "aborted";

export interface PluginErrorInfo {
  kind: ErrorKind;
  message: string;
  status?: number;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: PluginErrorInfo };

export interface ConnectionTest {
  reachable: boolean;
  keyValid: boolean;
  version: string | null;
  buildSha: string | null;
  detail: string;
}

export type RuntimeState =
  | "external"
  | "not-installed"
  | "installing"
  | "installed"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "crashed";

export interface RuntimeStatus {
  mode: RunMode;
  state: RuntimeState;
  /** True when the running OmniRoute was started by this plugin. */
  ownedByPlugin: boolean;
  version: string | null;
  pid: number | null;
  port: number;
  installDir: string | null;
  nodePath: string | null;
  lastError: string | null;
  logTail: string[];
}

/** One-manual-step check (BRIEF 4.6 disclosure). */
export interface ManualStepStatus {
  /** Every LearnHarness slot that has a model points at a plugin-owned combo through the Custom endpoint. */
  complete: boolean;
  pending: { target: Target; current: string | null; expected: string }[];
  /** Chats that set their own model outside the OmniRoute combos (from turn-settled). */
  bypassingChats: { chatId: string; model: string }[];
}

export interface ComboSummary {
  id: string;
  name: string;
  strategy: string;
  isActive: boolean;
  models: string[];
  ownedByPlugin: boolean;
  target: Target | null;
}

export interface CallLogRow {
  id: string;
  timestamp: string;
  status: number;
  requestedModel: string | null;
  model: string | null;
  provider: string | null;
  account: string | null;
  durationMs: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: number | null;
  comboName: string | null;
  apiKeyName: string | null;
  fallbackSteps: number | null;
  cacheHit: boolean;
  error: string | null;
  active: boolean;
}

export interface ExplorerEndpoint {
  path: string;
  summary: string;
  tags: string[];
  parameters: { name: string; in: string; required: boolean; description: string }[];
}

export interface ChangeLogEntry {
  id: string;
  at: string;
  action: "combo.create" | "combo.update" | "combo.delete" | "connection.toggle" | "bootstrap";
  objectId: string;
  objectName: string;
  before: unknown;
  after: unknown;
  revertedAt?: string;
}
