// Self-update from this plugin's GitHub releases (works on every LearnHarness from 0.6.1;
// 0.6.5+ also offers the host's own "Update" button for the same releases).
//
// Safety: an update is installed only if its zip carries a valid Ed25519 signature
// made with the release key (public half below; private half never in the repo).
// Nothing is executed during the update: files are verified, staged and swapped in;
// the new code runs after LearnHarness restarts, like any plugin update.
import * as fs from "node:fs";
import * as path from "node:path";
import { createPublicKey, verify } from "node:crypto";
import { unzipSync } from "fflate";
import { readVersioned, writeJsonAtomic } from "./store.ts";

/** Release-signing public key (Ed25519, SPKI PEM). Matches ~/.config/omniroute-lh/release-signing-key.pem. */
export const RELEASE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEACz/6jxJjtdLyYseNYKhZsPsNeinDs7bbH/HB41OjxZU=
-----END PUBLIC KEY-----
`;

export type UpdateMode = "install" | "notify" | "off";
const MAX_ZIP = 25 * 1024 * 1024;
const MAX_UNPACKED = 50 * 1024 * 1024;
const ALLOWED_DOWNLOAD_HOSTS = new Set(["github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"]);
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export interface UpdateStatus {
  current: string;
  latest: string | null;
  available: boolean;
  /** Version installed into dist/ that becomes active after a restart. */
  pendingRestart: string | null;
  checkedAt: string | null;
  error: string | null;
  mode: UpdateMode;
  repository: string | null;
}

interface UpdateState {
  version: 1;
  mode: UpdateMode;
  checkedAt: string | null;
  latest: string | null;
  pendingRestart: string | null;
  error: string | null;
}

export function compareVersions(a: string, b: string): number {
  const p = (v: string) => (/^\d+\.\d+\.\d+$/.test(v) ? v.split(".").map(Number) : null);
  const x = p(a);
  const y = p(b);
  if (!x || !y) return 0;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i]! - y[i]!;
  return 0;
}

export function verifySignature(zip: Uint8Array, signatureB64: string, publicKeyPem = RELEASE_PUBLIC_KEY): boolean {
  try {
    const sig = Buffer.from(signatureB64.trim(), "base64");
    if (sig.length !== 64) return false;
    return verify(null, zip, createPublicKey(publicKeyPem), sig);
  } catch {
    return false;
  }
}

/** Extract `<id>/dist/*` (or `dist/*`, or top-level files) from a release zip into a file map. Flat packages only. */
export function extractPackage(zip: Uint8Array, id: string): Map<string, Uint8Array> {
  let entries: Record<string, Uint8Array>;
  let total = 0;
  try {
    entries = unzipSync(zip, {
      filter: (f) => {
        total += f.originalSize;
        if (total > MAX_UNPACKED) throw new Error("The update unpacks to more than 50 MB.");
        return !f.name.endsWith("/");
      },
    });
  } catch (error) {
    throw new Error(`The update isn't a readable zip: ${(error as Error).message}`);
  }
  const names = Object.keys(entries);
  const prefix = [`${id}/dist/`, "dist/", ""].find((p) => names.includes(`${p}manifest.json`));
  if (prefix === undefined) throw new Error("The update zip has no manifest.json.");
  const files = new Map<string, Uint8Array>();
  for (const name of names) {
    if (!name.startsWith(prefix)) continue;
    const rel = name.slice(prefix.length);
    if (!SAFE_NAME.test(rel)) throw new Error(`The update contains an unexpected path: ${name}`);
    files.set(rel, entries[name]!);
  }
  return files;
}

export interface UpdaterDeps {
  /** The plugin's installed code folder: <plugins>/<id>/dist. */
  codeDirectory: string;
  dataDirectory: string;
  manifest: { id: string; version: string; minAppVersion: string };
  repository: string | null;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
  emit: (topic: string, data?: unknown) => void;
  /** Tests only; production always uses RELEASE_PUBLIC_KEY. */
  publicKeyPem?: string;
}

export class Updater {
  private readonly file: string;
  private busy = false;
  constructor(private readonly deps: UpdaterDeps) {
    this.file = path.join(deps.dataDirectory, "update.json");
  }

  private read(): UpdateState {
    return readVersioned(this.file, 1, () => ({ version: 1, mode: "install", checkedAt: null, latest: null, pendingRestart: null, error: null }), (raw) => ({
      version: 1,
      mode: raw.mode === "notify" || raw.mode === "off" ? raw.mode : "install",
      checkedAt: typeof raw.checkedAt === "string" ? raw.checkedAt : null,
      latest: typeof raw.latest === "string" ? raw.latest : null,
      pendingRestart: typeof raw.pendingRestart === "string" ? raw.pendingRestart : null,
      error: typeof raw.error === "string" ? raw.error : null,
    }));
  }
  private write(patch: Partial<UpdateState>): UpdateState {
    const next = { ...this.read(), ...patch, version: 1 as const };
    writeJsonAtomic(this.file, next);
    return next;
  }

  status(): UpdateStatus {
    const s = this.read();
    const current = this.deps.manifest.version;
    // A pending version equal to the running one means the restart already happened.
    const pending = s.pendingRestart && compareVersions(s.pendingRestart, current) > 0 ? s.pendingRestart : null;
    return {
      current,
      latest: s.latest,
      available: !!s.latest && compareVersions(s.latest, current) > 0 && !pending,
      pendingRestart: pending,
      checkedAt: s.checkedAt,
      error: s.error,
      mode: s.mode,
      repository: this.deps.repository,
    };
  }

  setMode(mode: UpdateMode): UpdateStatus {
    if (mode !== "install" && mode !== "notify" && mode !== "off") throw new Error("Unknown update mode");
    this.write({ mode });
    return this.status();
  }

  private async get(url: string, accept: string): Promise<Response> {
    const res = await (this.deps.fetchImpl ?? fetch)(url, {
      headers: { accept, "user-agent": "omniroute-lh-updater" },
      signal: AbortSignal.any([this.deps.signal, AbortSignal.timeout(60_000)]),
      redirect: "follow",
    });
    const host = new URL(res.url || url).hostname;
    if (!host.endsWith("github.com") && !ALLOWED_DOWNLOAD_HOSTS.has(host) && !host.endsWith(".githubusercontent.com")) throw new Error(`Update download left GitHub (${host}).`);
    if (res.status === 403 || res.status === 429) throw new Error("GitHub is rate-limiting update checks; the plugin will try again later.");
    if (!res.ok) throw new Error(`GitHub answered ${res.status}.`);
    return res;
  }

  private async bytes(url: string): Promise<Uint8Array> {
    const res = await this.get(url, "application/octet-stream");
    const len = Number(res.headers.get("content-length") ?? "0");
    if (len > MAX_ZIP) throw new Error("The update is larger than 25 MB.");
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > MAX_ZIP) throw new Error("The update is larger than 25 MB.");
    return buf;
  }

  /** Check GitHub's latest (non-pre-release) release; install it when mode is "install" (or force). */
  async check(opts: { install?: boolean } = {}): Promise<UpdateStatus> {
    if (this.busy) return this.status();
    const repo = this.deps.repository;
    if (!repo) return this.status();
    this.busy = true;
    try {
      const res = await this.get(`https://api.github.com/repos/${repo}/releases/latest`, "application/vnd.github+json");
      const body = (await res.json()) as { tag_name?: unknown; assets?: unknown };
      const tag = typeof body.tag_name === "string" ? body.tag_name.replace(/^v/i, "") : "";
      if (!/^\d+\.\d+\.\d+$/.test(tag)) throw new Error("The latest release has no x.y.z version tag.");
      this.write({ latest: tag, checkedAt: new Date().toISOString(), error: null });
      const st = this.status();
      const wantInstall = opts.install ?? st.mode === "install";
      if (!st.available || !wantInstall) {
        if (st.available) this.deps.emit("update-available", st);
        return st;
      }
      const assets = (Array.isArray(body.assets) ? body.assets : []) as { name?: unknown; browser_download_url?: unknown }[];
      const id = this.deps.manifest.id;
      const zipAsset = assets.find((a) => a.name === `${id}-${tag}.zip`);
      const sigAsset = assets.find((a) => a.name === `${id}-${tag}.zip.sig`);
      if (!zipAsset || typeof zipAsset.browser_download_url !== "string") throw new Error(`Release ${tag} has no ${id}-${tag}.zip.`);
      if (!sigAsset || typeof sigAsset.browser_download_url !== "string") throw new Error(`Release ${tag} isn't signed (no .sig file); not installing it automatically.`);
      const zip = await this.bytes(zipAsset.browser_download_url);
      const sig = new TextDecoder().decode(await this.bytes(sigAsset.browser_download_url));
      if (!verifySignature(zip, sig, this.deps.publicKeyPem)) throw new Error(`Release ${tag} has an invalid signature; not installing it.`);
      await this.install(zip, tag);
      this.write({ pendingRestart: tag, error: null });
      const done = this.status();
      this.deps.emit("update-installed", done);
      return done;
    } catch (error) {
      if (this.deps.signal.aborted) return this.status();
      this.write({ error: (error as Error).message, checkedAt: new Date().toISOString() });
      return this.status();
    } finally {
      this.busy = false;
    }
  }

  /** Verify the package and swap it into dist/, keeping the previous dist as dist.previous. */
  async install(zip: Uint8Array, expectedVersion: string): Promise<void> {
    const dist = this.deps.codeDirectory;
    if (path.basename(dist) !== "dist") throw new Error("This install doesn't use the community plugin layout; update it manually.");
    const root = path.dirname(dist);
    if (path.basename(root) !== this.deps.manifest.id) throw new Error("The plugin folder name doesn't match its id; update it manually.");
    const files = extractPackage(zip, this.deps.manifest.id);
    const manifestBytes = files.get("manifest.json");
    if (!manifestBytes) throw new Error("The update has no manifest.json.");
    const m = JSON.parse(new TextDecoder().decode(manifestBytes)) as Record<string, unknown>;
    if (m.id !== this.deps.manifest.id) throw new Error("The update is for a different plugin.");
    if (m.version !== expectedVersion) throw new Error("The update's version doesn't match its release.");
    // The plugin API doesn't expose LearnHarness's version, so never auto-install an update
    // that needs a newer app than this one did: the host could refuse to load it after restart.
    if (typeof m.minAppVersion !== "string" || compareVersions(m.minAppVersion, this.deps.manifest.minAppVersion) > 0) {
      throw new Error(`Version ${expectedVersion} needs LearnHarness ${String(m.minAppVersion)} or newer; update LearnHarness first, then install it from the release page.`);
    }
    for (const f of ["main", "backend", "styles"]) if (typeof m[f] === "string" && !files.has(m[f] as string)) throw new Error(`The update is missing ${m[f]}.`);

    const next = path.join(root, "dist.next");
    const prev = path.join(root, "dist.previous");
    for (const p of [next, prev]) {
      const st = fs.lstatSync(p, { throwIfNoEntry: false });
      if (st?.isSymbolicLink()) throw new Error(`Refusing to update: ${p} is a link.`);
    }
    fs.rmSync(next, { recursive: true, force: true });
    fs.mkdirSync(next);
    for (const [name, data] of files) fs.writeFileSync(path.join(next, name), data);
    fs.rmSync(prev, { recursive: true, force: true });
    await renameWithRetry(dist, prev);
    try {
      await renameWithRetry(next, dist);
    } catch (error) {
      await renameWithRetry(prev, dist);
      throw error;
    }
  }
}

/** Windows: antivirus/indexers briefly lock files; retry EPERM/EBUSY/EACCES a few times. */
async function renameWithRetry(from: string, to: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= 8 || !(code === "EPERM" || code === "EBUSY" || code === "EACCES")) throw error;
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
}
