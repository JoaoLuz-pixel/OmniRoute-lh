// Recursive redaction of anything that looks like a secret, applied to every
// OmniRoute response before it can reach the browser part (BRIEF 4.7, endpoint inventory).

const SECRET_NAME = /(^|[_-])(api[_-]?key|key|token|access[_-]?token|refresh[_-]?token|id[_-]?token|secret|password|passwd|authorization|cookie|credential|credentials|session[_-]?token|private[_-]?key)s?$/i;
const SECRET_CAMEL = /(apiKey|Key|Token|token|Secret|secret|Password|password|Cookie|cookie|Credential|credential|authorization|Authorization)$/;
/** Whole subtrees known to carry provider secrets. */
const DROP = new Set(["providerSpecificData", "requestBody", "responseBody", "headers", "rawHeaders"]);
/** Field names that end like a secret but are harmless metadata. */
const ALLOW = new Set(["tokens", "tokensIn", "tokensOut", "maxTokens", "contextTokens", "inputTokens", "outputTokens", "totalTokens", "apiKeyName", "apiKeyId", "keyId", "keyName", "keyPresent", "hasApiKey", "tokenCount", "tokenLimit", "tokenLimits", "pricedTokens"]);

export const REDACTED = "[redacted]";

export function isSecretField(name: string): boolean {
  if (ALLOW.has(name)) return false;
  if (/tokens?(In|Out|Count|Limit|s)$/i.test(name) && !/access|refresh|id|session|bearer/i.test(name)) return false;
  return SECRET_NAME.test(name) || SECRET_CAMEL.test(name);
}

export interface RedactOptions {
  maxDepth?: number;
  maxArray?: number;
  maxString?: number;
}

export function redact(value: unknown, options: RedactOptions = {}, depth = 0): unknown {
  const maxDepth = options.maxDepth ?? 12;
  const maxArray = options.maxArray ?? 1000;
  const maxString = options.maxString ?? 4000;
  if (depth > maxDepth) return "[…]";
  if (typeof value === "string") {
    if (/^Bearer\s+\S+/i.test(value)) return REDACTED;
    if (/\b(sk|om|oma|or)-[A-Za-z0-9_-]{16,}/.test(value)) return value.replace(/\b(sk|om|oma|or)-[A-Za-z0-9_-]{16,}/g, REDACTED);
    return value.length > maxString ? value.slice(0, maxString) + "…" : value;
  }
  if (Array.isArray(value)) {
    const out = value.slice(0, maxArray).map((v) => redact(v, options, depth + 1));
    if (value.length > maxArray) out.push(`[… ${value.length - maxArray} more]`);
    return out;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (DROP.has(k)) continue;
      out[k] = isSecretField(k) && v !== null && v !== undefined && v !== "" && typeof v !== "boolean" ? REDACTED : redact(v, options, depth + 1);
    }
    return out;
  }
  return value;
}
