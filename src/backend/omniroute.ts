// HTTP client for OmniRoute's management and inference APIs. Server part only.
// Every call: timeout, abort on the activation signal, plain-language errors,
// and responses treated as untrusted (callers validate shapes).
import type { ErrorKind, PluginErrorInfo } from "../shared/protocol.ts";

export class OmniRouteError extends Error {
  constructor(
    readonly kind: ErrorKind,
    message: string,
    readonly status?: number
  ) {
    super(message);
  }
  toInfo(): PluginErrorInfo {
    return { kind: this.kind, message: this.message, ...(this.status !== undefined && { status: this.status }) };
  }
}

export interface ClientOptions {
  baseUrl: string;
  /** Bearer key; empty string sends no Authorization header. */
  key: string;
  signal: AbortSignal;
  timeoutMs?: number;
  /** Max response bytes accepted (Explorer safety). */
  maxBytes?: number;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
  /** Extra headers (e.g. a session cookie during first-run bootstrap). Never logged. */
  headers?: Record<string, string>;
  /** Don't send the stored key (public endpoints, bootstrap). */
  anonymous?: boolean;
}

export interface RawResponse {
  status: number;
  headers: Headers;
  body: unknown;
}

function describeHttp(status: number, path: string, serverMessage: string | null): OmniRouteError {
  const tail = serverMessage ? ` OmniRoute said: "${serverMessage}"` : "";
  if (status === 401) return new OmniRouteError("unauthorized", `OmniRoute rejected the key (401). Check the management key in the plugin settings.${tail}`, status);
  if (status === 403)
    return new OmniRouteError(
      "forbidden",
      `OmniRoute refused access (403). The key is probably an inference-only key; the plugin needs a key with the "manage" scope.${tail}`,
      status
    );
  if (status === 404) return new OmniRouteError("not-found", `${path} is not available on this OmniRoute version (404).`, status);
  if (status === 409) return new OmniRouteError("conflict", `OmniRoute reported a conflict (409).${tail}`, status);
  if (status === 400) return new OmniRouteError("invalid-input", `OmniRoute rejected the request (400).${tail}`, status);
  return new OmniRouteError("http", `OmniRoute answered ${status} for ${path}.${tail}`, status);
}

function serverMessageOf(body: unknown): string | null {
  if (!body || typeof body !== "object") return typeof body === "string" && body.length < 300 ? body : null;
  const b = body as Record<string, unknown>;
  const e = b.error;
  if (typeof e === "string") return e.slice(0, 300);
  if (e && typeof e === "object" && typeof (e as Record<string, unknown>).message === "string") return String((e as Record<string, unknown>).message).slice(0, 300);
  if (typeof b.message === "string") return b.message.slice(0, 300);
  return null;
}

export class OmniRouteClient {
  constructor(private readonly opts: ClientOptions) {}

  get baseUrl(): string {
    return this.opts.baseUrl;
  }

  async request(path: string, options: RequestOptions = {}): Promise<RawResponse> {
    if (!path.startsWith("/")) throw new OmniRouteError("invalid-input", "Path must start with /");
    const url = new URL(this.opts.baseUrl + path);
    for (const [k, v] of Object.entries(options.query ?? {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    const timeoutMs = options.timeoutMs ?? this.opts.timeoutMs ?? 10_000;
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = AbortSignal.any([this.opts.signal, timeout]);
    const headers: Record<string, string> = { accept: "application/json", ...options.headers };
    if (!options.anonymous && this.opts.key) headers.authorization = `Bearer ${this.opts.key}`;
    if (options.body !== undefined) headers["content-type"] = "application/json";
    let res: Response;
    try {
      res = await (this.opts.fetchImpl ?? fetch)(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal,
        redirect: "manual",
      });
    } catch (error) {
      if (this.opts.signal.aborted) throw new OmniRouteError("aborted", "The plugin was stopped.");
      if (timeout.aborted) throw new OmniRouteError("timeout", `OmniRoute didn't answer within ${Math.round(timeoutMs / 1000)} s (${path}).`);
      throw new OmniRouteError("unreachable", `Can't reach OmniRoute at ${this.opts.baseUrl}. Is it running? (${(error as Error).message})`);
    }
    const body = await this.readBody(res, path);
    if (res.status >= 300 && res.status < 400) throw new OmniRouteError("http", `OmniRoute redirected ${path} (${res.status}); check the address.`, res.status);
    if (!res.ok) throw describeHttp(res.status, path, serverMessageOf(body));
    return { status: res.status, headers: res.headers, body };
  }

  private async readBody(res: Response, path: string): Promise<unknown> {
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/event-stream")) {
      await res.body?.cancel();
      throw new OmniRouteError("bad-response", `${path} is a live stream; the plugin doesn't read streams.`);
    }
    const maxBytes = this.opts.maxBytes ?? 8 * 1024 * 1024;
    const declared = Number(res.headers.get("content-length") ?? "0");
    if (declared > maxBytes) {
      await res.body?.cancel();
      throw new OmniRouteError("bad-response", `${path} returned more data than the plugin accepts (${Math.round(declared / 1024)} KB).`);
    }
    const reader = res.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new OmniRouteError("bad-response", `${path} returned more data than the plugin accepts.`);
      }
      chunks.push(value);
    }
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    if (!text) return null;
    if (type.includes("json") || /^[[{]/.test(text.trimStart())) {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        if (res.ok) throw new OmniRouteError("bad-response", `${path} returned invalid JSON.`);
      }
    }
    return text;
  }

  async getJson(path: string, query?: RequestOptions["query"]): Promise<unknown> {
    return (await this.request(path, { query })).body;
  }
}

// ── shape helpers (responses are untrusted) ───────────────────────────────

export function asRecord(v: unknown, what: string): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new OmniRouteError("bad-response", `Unexpected ${what} from OmniRoute (not an object).`);
  return v as Record<string, unknown>;
}
export function asArray(v: unknown, what: string): unknown[] {
  if (!Array.isArray(v)) throw new OmniRouteError("bad-response", `Unexpected ${what} from OmniRoute (not a list).`);
  return v;
}
export const optStr = (v: unknown): string | null => (typeof v === "string" ? v : null);
export const optNum = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
