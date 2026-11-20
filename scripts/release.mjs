#!/usr/bin/env node
// Package dist/ as release/omniroute-lh-<version>.zip with the layout
//   omniroute-lh/dist/manifest.json, main.js, backend.cjs, watchdog.cjs, styles.css, README.md, LICENSE
// so extracting it into LearnHarness's plugins folder gives <plugins>/omniroute-lh/dist/.
// Run `npm run check` first (the npm script does). Never includes data/, keys or sources.
import { spawnSync } from "node:child_process";
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
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
