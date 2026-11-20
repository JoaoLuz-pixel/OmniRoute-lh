// Local log of every change the plugin made in OmniRoute (BRIEF 4.5), with revert data.
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { ChangeLogEntry } from "../shared/protocol.ts";
import { appendJsonLine, readJsonLines } from "./store.ts";
import { redact } from "./redact.ts";

export class ChangeLog {
  private readonly file: string;
  constructor(dataDirectory: string) {
    this.file = path.join(dataDirectory, "changes.jsonl");
  }
  add(entry: Omit<ChangeLogEntry, "id" | "at">): ChangeLogEntry {
    // before/after are OmniRoute objects: redact defensively before persisting.
    const full: ChangeLogEntry = { id: randomUUID(), at: new Date().toISOString(), ...entry, before: redact(entry.before), after: redact(entry.after) };
    appendJsonLine(this.file, full);
    return full;
  }
  markReverted(id: string): void {
    appendJsonLine(this.file, { revertOf: id, at: new Date().toISOString() });
  }
  list(limit = 200): ChangeLogEntry[] {
    const lines = readJsonLines<ChangeLogEntry & { revertOf?: string }>(this.file, 2000);
    const reverted = new Map<string, string>();
    for (const l of lines) if (l.revertOf) reverted.set(l.revertOf, l.at);
    return lines
      .filter((l) => !l.revertOf)
      .map((l) => (reverted.has(l.id) ? { ...l, revertedAt: reverted.get(l.id)! } : l))
      .slice(-limit)
      .reverse();
  }
  get(id: string): ChangeLogEntry | undefined {
    return this.list(2000).find((e) => e.id === id);
  }
}
