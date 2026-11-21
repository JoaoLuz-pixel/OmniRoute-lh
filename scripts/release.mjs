#!/usr/bin/env node
// Package dist/ as release/omniroute-lh-<version>.zip with the layout
//   omniroute-lh/dist/manifest.json, main.js, backend.cjs, watchdog.cjs, styles.css, README.md, LICENSE
// so extracting it into LearnHarness's plugins folder gives <plugins>/omniroute-lh/dist/.
// Run `npm run check` first (the npm script does). Never includes data/, keys or sources.
import { spawnSync } from "node:child_process";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const manifest = JSON.parse(fs.readFileSync(path.join(dist, "manifest.json"), "utf8"));
const expected = ["LICENSE", "README.md", "backend.cjs", "main.js", "manifest.json", "styles.css", "watchdog.cjs"];
const actual = fs.readdirSync(dist).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Unexpected dist/ contents: ${actual.join(", ")}`);
for (const f of actual) {
  const text = fs.readFileSync(path.join(dist, f), "utf8");
  if (/\bom-[A-Za-z0-9]{20,}|\bsk-[A-Za-z0-9]{20,}/.test(text)) throw new Error(`${f} looks like it contains a key; refusing to package.`);
}

const stage = fs.mkdtempSync(path.join(os.tmpdir(), "orl-release-"));
try {
  const pkgDir = path.join(stage, manifest.id, "dist");
  fs.mkdirSync(pkgDir, { recursive: true });
  for (const f of actual) fs.copyFileSync(path.join(dist, f), path.join(pkgDir, f));
  const outDir = path.join(root, "release");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${manifest.id}-${manifest.version}.zip`);
  fs.rmSync(out, { force: true });
  const py = process.platform === "win32" ? "python" : "python3";
  const r = spawnSync(py, ["-I", "-m", "zipfile", "-c", out, manifest.id], { cwd: stage, stdio: "inherit" });
  if (r.status !== 0) throw new Error("zip creation failed (needs Python 3)");
  console.log(`Release package: ${out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
  // Sign the zip (Ed25519) so the plugin's self-updater accepts it. The private key never
  // lives in the repo: OMNIROUTE_LH_SIGNING_KEY or ~/.config/omniroute-lh/release-signing-key.pem.
  const keyFile = process.env.OMNIROUTE_LH_SIGNING_KEY || path.join(os.homedir(), ".config", "omniroute-lh", "release-signing-key.pem");
  if (!fs.existsSync(keyFile)) throw new Error(`No signing key at ${keyFile}; the self-updater would refuse this release.`);
  const zip = fs.readFileSync(out);
  const signature = sign(null, zip, createPrivateKey(fs.readFileSync(keyFile)));
  const embedded = fs.readFileSync(path.join(root, "src", "backend", "updater.ts"), "utf8").match(/-----BEGIN PUBLIC KEY-----[\s\S]+?-----END PUBLIC KEY-----\n/)?.[0];
  if (!embedded || !verify(null, zip, createPublicKey(embedded), signature)) throw new Error("The signing key doesn't match the public key embedded in the plugin.");
  fs.writeFileSync(`${out}.sig`, signature.toString("base64") + "\n");
  console.log(`Signature: ${out}.sig (verified against the embedded public key)`);
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
