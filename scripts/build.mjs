#!/usr/bin/env node
// Build the installable package into dist/ (plugin guide layout):
//   dist/manifest.json, main.js (browser ESM), backend.cjs (Node CJS),
//   watchdog.cjs (system-Node helper), styles.css, README.md, LICENSE
// Refuses symlinked dist/ and any dist/data (never build over plugin data).
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = path.join(root, "dist");

const st = fs.lstatSync(out, { throwIfNoEntry: false });
if (st?.isSymbolicLink()) throw new Error("Refusing to build into a symlinked dist/.");
if (fs.lstatSync(path.join(out, "data"), { throwIfNoEntry: false })) throw new Error("Refusing to build: dist/data exists. Plugin data belongs next to dist/, not inside it.");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (manifest.version !== pkg.version) throw new Error(`manifest.json version ${manifest.version} != package.json ${pkg.version}`);
if (manifest.minAppVersion !== "0.6.1") throw new Error("minAppVersion must stay 0.6.1 (compatibility baseline).");

const common = { absWorkingDir: root, bundle: true, minify: true, legalComments: "eof", metafile: true, sourcemap: false, logLevel: "warning" };
const results = await Promise.all([
  build({ ...common, entryPoints: ["src/frontend/main.ts"], outfile: path.join(out, "main.js"), format: "esm", platform: "browser", target: "es2022" }),
  build({ ...common, entryPoints: ["src/backend/index.ts"], outfile: path.join(out, "backend.cjs"), format: "cjs", platform: "node", target: "node22" }),
  build({ ...common, entryPoints: ["src/watchdog/watchdog.ts"], outfile: path.join(out, "watchdog.cjs"), format: "cjs", platform: "node", target: "node22" }),
]);
for (const r of results) {
  for (const input of Object.keys(r.metafile.inputs)) {
    if (!input.startsWith("src/") && !input.startsWith("node_modules/fflate/")) throw new Error(`Unexpected runtime input in bundle: ${input} (only type-only SDK imports are allowed)`);
  }
}
for (const [from, to] of [["manifest.json", "manifest.json"], ["src/frontend/styles.css", "styles.css"], ["README.md", "README.md"], ["LICENSE", "LICENSE"]]) {
  fs.copyFileSync(path.join(root, from), path.join(out, to));
}
const size = (f) => `${(fs.statSync(path.join(out, f)).size / 1024).toFixed(1)} KB`;
console.log(`Built ${manifest.id} ${manifest.version} → ${out}`);
console.log(`  main.js ${size("main.js")} · backend.cjs ${size("backend.cjs")} · watchdog.cjs ${size("watchdog.cjs")}`);
