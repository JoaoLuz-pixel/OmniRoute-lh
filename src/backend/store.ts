// Atomic, versioned JSON files in the plugin's data directory.
import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes } from "node:crypto";

export class NewerFormatError extends Error {}

/** Write JSON atomically: temp file in the same directory, fsync, rename. Mode 600. */
export function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  const fd = fs.openSync(tmp, "w", 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(value, null, 2) + "\n");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, file);
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    /* Windows: mode bits are advisory */
  }
}

/**
 * Read a versioned JSON document. Missing file → fallback. A file written by a
 * newer plugin version is refused rather than rewritten (plugin-authoring rule).
 */
export function readVersioned<T extends { version: number }>(
  file: string,
  currentVersion: number,
  fallback: () => T,
  migrate: (raw: Record<string, unknown>) => T
): T {
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback();
    throw error;
  }
  const raw = JSON.parse(text) as unknown;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${path.basename(file)} is not a JSON object`);
  const version = (raw as { version?: unknown }).version;
  if (typeof version !== "number") throw new Error(`${path.basename(file)} has no version`);
  if (version > currentVersion) {
    throw new NewerFormatError(`${path.basename(file)} was written by a newer version of this plugin (format ${version}); update the plugin.`);
  }
  return migrate(raw as Record<string, unknown>);
}

/** Append one JSON line (used for logs that are only ever appended). */
export function appendJsonLine(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(value) + "\n", { mode: 0o600 });
}

export function readJsonLines<T>(file: string, limit = 500): T[] {
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const out: T[] = [];
  for (const line of text.split("\n").slice(-limit - 1)) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch {
      /* skip a torn last line */
    }
  }
  return out.slice(-limit);
}
