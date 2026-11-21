// Self-updater against a fake GitHub: signature, package checks, swap that keeps data/.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { generateKeyPairSync, sign } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { Updater, verifySignature, compareVersions } from "../src/backend/updater.ts";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const PUB = publicKey.export({ type: "spki", format: "pem" }).toString();
const other = generateKeyPairSync("ed25519").privateKey;

function pkg(version: string, minAppVersion = "0.6.1"): Uint8Array {
  const manifest = { apiVersion: 1, id: "omniroute-lh", name: "x", version, minAppVersion, main: "main.js", backend: "backend.cjs" };
  return zipSync({ "omniroute-lh/dist/manifest.json": strToU8(JSON.stringify(manifest)), "omniroute-lh/dist/main.js": strToU8(`export const v="${version}"`), "omniroute-lh/dist/backend.cjs": strToU8("module.exports={}") });
}
const sig = (zip: Uint8Array, key = privateKey) => sign(null, zip, key).toString("base64");

function setup(release: { tag: string; zip?: Uint8Array; sig?: string | null }, mode?: "install" | "notify") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "orl-upd-"));
  const pluginDir = path.join(root, "omniroute-lh");
  const dist = path.join(pluginDir, "dist");
  const data = path.join(pluginDir, "data");
  fs.mkdirSync(dist, { recursive: true });
  fs.mkdirSync(data);
  fs.writeFileSync(path.join(dist, "main.js"), "old");
  fs.writeFileSync(path.join(data, "settings.json"), "{\"keep\":true}");
  const assets = [
    ...(release.zip ? [{ name: `omniroute-lh-${release.tag}.zip`, browser_download_url: "https://github.com/x/zip" }] : []),
    ...(release.sig !== null && release.sig !== undefined ? [{ name: `omniroute-lh-${release.tag}.zip.sig`, browser_download_url: "https://github.com/x/sig" }] : []),
  ];
  const fetchImpl = (async (url: string | URL) => {
    const u = String(url);
    const body = u.includes("/releases/latest") ? JSON.stringify({ tag_name: `v${release.tag}`, assets }) : u.endsWith("/zip") ? release.zip! : release.sig!;
    const r = new Response(body as BodyInit, { status: 200 });
    Object.defineProperty(r, "url", { value: u });
    return r;
  }) as typeof fetch;
  const events: string[] = [];
  const u = new Updater({ codeDirectory: dist, dataDirectory: data, manifest: { id: "omniroute-lh", version: "0.1.5", minAppVersion: "0.6.1" }, repository: "o/r", signal: new AbortController().signal, fetchImpl, emit: (t) => events.push(t), publicKeyPem: PUB });
  if (mode) u.setMode(mode);
  return { u, dist, data, pluginDir, events };
}

test("versions and signatures", () => {
  assert.ok(compareVersions("0.1.6", "0.1.5") > 0);
  assert.equal(compareVersions("0.1.5", "0.1.5"), 0);
  const z = pkg("0.1.6");
  assert.ok(verifySignature(z, sig(z), PUB));
  assert.ok(!verifySignature(z, sig(z, other), PUB));
  const tampered = Uint8Array.from(z);
  tampered[tampered.length - 5] = (tampered[tampered.length - 5] ?? 0) ^ 1;
  assert.ok(!verifySignature(tampered, sig(z), PUB));
  assert.ok(!verifySignature(z, "not base64 !!", PUB));
});

test("signed newer release installs, keeps data/ and the previous dist", async () => {
  const z = pkg("0.1.6");
  const { u, dist, data, pluginDir, events } = setup({ tag: "0.1.6", zip: z, sig: sig(z) });
  const st = await u.check();
  assert.equal(st.error, null);
  assert.equal(st.pendingRestart, "0.1.6");
  assert.match(fs.readFileSync(path.join(dist, "main.js"), "utf8"), /0\.1\.6/);
  assert.equal(fs.readFileSync(path.join(pluginDir, "dist.previous", "main.js"), "utf8"), "old");
  assert.equal(fs.readFileSync(path.join(data, "settings.json"), "utf8"), "{\"keep\":true}");
  assert.ok(events.includes("update-installed"));
});

test("unsigned, wrongly signed, tampered and too-new releases are refused; dist untouched", async () => {
  const z = pkg("0.1.6");
  const cases = [
    setup({ tag: "0.1.6", zip: z, sig: null }),
    setup({ tag: "0.1.6", zip: z, sig: sig(z, other) }),
    setup({ tag: "0.1.6", zip: pkg("0.1.6"), sig: sig(pkg("0.1.7")) }),
    setup({ tag: "0.1.6", zip: pkg("0.1.6", "0.7.0"), sig: sig(pkg("0.1.6", "0.7.0")) }),
    setup({ tag: "0.1.6", zip: pkg("0.1.7"), sig: sig(pkg("0.1.7")) }),
  ];
  for (const c of cases) {
    const st = await c.u.check();
    assert.ok(st.error, "error reported");
    assert.equal(st.pendingRestart, null);
    assert.equal(fs.readFileSync(path.join(c.dist, "main.js"), "utf8"), "old");
  }
});

test("notify mode reports but doesn't install; same version is a no-op", async () => {
  const z = pkg("0.1.6");
  const n = setup({ tag: "0.1.6", zip: z, sig: sig(z) }, "notify");
  const st = await n.u.check();
  assert.equal(st.available, true);
  assert.equal(fs.readFileSync(path.join(n.dist, "main.js"), "utf8"), "old");
  assert.ok(n.events.includes("update-available"));
  const same = setup({ tag: "0.1.5", zip: pkg("0.1.5"), sig: sig(pkg("0.1.5")) });
  const s2 = await same.u.check();
  assert.equal(s2.available, false);
  assert.equal(fs.readFileSync(path.join(same.dist, "main.js"), "utf8"), "old");
});
