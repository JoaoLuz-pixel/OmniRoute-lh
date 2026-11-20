#!/usr/bin/env node
// Generate the plugin SDK types exactly as they were in LearnHarness v0.6.1
// (commit cb25c8e), into ./.sdk. This is the compatibility baseline: the plugin
// typechecks against these, so it cannot use anything added after v0.6.1.
//
// Usage: node scripts/sdk.mjs <learnharness-checkout> [commit]
// The checkout is only read (git archive + its node_modules); nothing is written to it.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const checkout = process.argv[2];
const commit = process.argv[3] ?? "cb25c8e";
if (!checkout || !fs.existsSync(path.join(checkout, ".git"))) {
  console.error("usage: node scripts/sdk.mjs <learnharness-checkout> [commit]");
  process.exit(2);
}
if (!fs.existsSync(path.join(checkout, "node_modules", "typescript"))) {
  console.error("The LearnHarness checkout needs its dependencies installed (npm ci) to emit types.");
  process.exit(2);
}

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, ".sdk");
const stage = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-lh-sdk-"));
try {
  const archive = spawnSync("git", ["-C", checkout, "archive", "--format=tar", commit], { maxBuffer: 1 << 30 });
  if (archive.status !== 0) throw new Error(`git archive ${commit} failed: ${archive.stderr}`);
  const untar = spawnSync("tar", ["-x", "-C", stage], { input: archive.stdout });
  if (untar.status !== 0) throw new Error(`tar failed: ${untar.stderr}`);
  fs.symlinkSync(path.join(path.resolve(checkout), "node_modules"), path.join(stage, "node_modules"), "junction");
  fs.rmSync(out, { recursive: true, force: true });
  const emit = spawnSync(process.execPath, [path.join(stage, "scripts", "build-plugin-types.mjs"), out], { stdio: "inherit", cwd: stage });
  if (emit.status !== 0) throw new Error("type emission failed");
  fs.writeFileSync(path.join(out, "BASELINE"), `LearnHarness ${commit} (v0.6.1 plugin API baseline)\n`);
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
