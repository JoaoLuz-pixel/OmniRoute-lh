# OmniRoute endpoint inventory

Source: upstream `cheaper-inference/OmniRoute` at `a6126184` (2026-11-20), read from the route handlers in `src/app/api/**/route.ts`. The handlers are authoritative; `docs/openapi.yaml` is used only for summaries.

- **Full generated list (1,156 method + path pairs):** [omniroute-endpoints.full.md](omniroute-endpoints.full.md). Regenerate it with `node scripts/build-endpoint-inventory.mjs <omniroute-clone> --md docs/omniroute-endpoints.full.md`.
- **Totals:** GET 491 · POST 451 · PUT 71 · PATCH 29 · DELETE 114. Most guarded routes use `requireManagementAuth`. Routes with no guard in the handler are still covered by the central policy in `src/proxy.ts`, which matches `/api/:path*` and `/v1/*`.
- **Path note:** `/api/v1/*` handlers are served at `/v1/*`.

## Auth facts the plugin relies on

- **Manage-scope API key:** `Authorization: Bearer <key>` passes `requireManagementAuth`. An inference-only key gets **403** ("Invalid management token"), unless a route sets `invalidApiKeyStatus: 401`.
- **No-auth installs:** when OmniRoute runs with auth turned off, `requireManagementAuth` lets everything through, unless a route sets `alwaysRequireAuth`. The plugin must therefore not treat "a call succeeded" as "the key is valid". Use the health check below.
- **Not used by the plugin:** dashboard sessions (cookies) and CLI tokens.

## Used by the plugin

Legend: **R** = read, **W** = write (always confirmed by the user or limited to `OmniRoute-*` combos, per BRIEF 4.5/4.6).

### Connection and health

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /api/health` | **No auth.** `{status:"ok", timestamp}`. Proves reachability only. |
| R | `GET /api/health/ping` | DB-backed readiness; 503 when the DB is down. |
| R | `GET /api/monitoring/health` | Calls `requireManagementAuth(…, {alwaysRequireAuth:true})`. With a valid manage key it returns the **full view**: `appVersion`, `buildSha`, `catalogCount`, connections, `circuitBreakers`, `rateLimitStatus`, `learnedLimits`, `lockouts`, `quotaMonitorSummary`, `activeSessions`, `activeSessionsByKey`, `credentialHealth`, and more. Otherwise it returns a public subset. **Test connection:** if the full view comes back, the key is valid, and the response also gives the version. |

### Models and combos (the routing lever)

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /v1/models` | Inference key or manage key. Models and combos as OpenAI-style ids; a combo's `display_name` comes from `displayName`. |
| R | `GET /api/combos?offset&limit` | `{combos:[…], total}`. Each combo adds `computed_context_length`. |
| R | `GET /api/combos/{id}` | One combo by UUID. |
| W | `POST /api/combos` | Body is `createComboSchema` (`src/shared/validation/schemas/combo.ts`): `name` (≤100 chars, `[a-zA-Z0-9_/.\-\[\] ]`), `models` (≥1), `strategy` (default `priority`), optional `description`, `displayName`, `config`, `allowedProviders`, `context_length`, … Returns **201** with the combo, plus an optional `warning` if the name collides with a model id. **400** if the name already exists or the DAG is invalid. |
| W | `PUT` or `PATCH /api/combos/{id}` | Same handler; it **merges** `updateComboSchema` onto the stored combo. To change the order or members, send the full `models` array (≥1). `null` clears a nullable field. Also `isActive`, `isHidden`, `strategy`. **There is no version or ETag**, so the plugin must re-read the combo just before writing and abort if it changed (lost-update guard). |
| W | `DELETE /api/combos/{id}` | Only for `OmniRoute-*` combos, with an extra confirmation. |
| — | `POST /api/combos/reorder` | Reorders the **combo list**, not the models inside a combo. Not used. |
| R | `GET /api/combos/metrics` | Per-combo metrics (the `DELETE` that resets them is not used). |
| R | `GET /api/combos/auto` · `?id=auto/<variant>` | Built-in virtual `auto/*` combos with their candidates. Used as autopilot candidate sources. |
| R | `GET /api/combos/builder/options` | Options for the combo builder (models, providers). Feeds the combo editor's pickers. |
| R | `POST /api/combos/test` | Tests a combo. Only on an explicit user click, because it may cost tokens. |
| R | `GET /api/usage/combo-health?comboId&range` | Health of one combo over time. |
| R | `GET /api/usage/combo-trace/{invocationId}` | Ordered per-target decision trace for one combo invocation (routing metadata only, never bodies or credentials). **Kept in memory for 30 minutes, up to 2,000 invocations.** How a call-log row links to `invocationId` is **unverified**; check it on a live instance. |

**Combo step shapes** (`comboModelEntry`): a plain string `"provider/model"`, or `{kind?:"model", provider?/providerId?, model, connectionId?, allowedConnectionIds?, weight?, label?, fallbackOnlyOnQuotaExhaustion?}`, or `{kind:"combo-ref", comboName}`. Wildcards are stored as `provider-wildcard`.

**Strategies (`ROUTING_STRATEGY_VALUES`):** `priority, weighted, round-robin, context-relay, fill-first, p2c, random, least-used, cost-optimized, reset-aware, reset-window, expiry-first, headroom, quota-weighted, strict-random, auto, lkgp, context-optimized, cache-optimized, fusion, pipeline, jev`. This list changes between versions, so read it at runtime from `combos/builder/options` (to verify) rather than hard-coding it. `OmniRoute-*` combos use `priority`. `fusion` and `pipeline` change the response semantics and are never chosen by the autopilot.

### Providers and connections

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /api/providers` | `{connections, total}`. **Warning:** `apiKey` is masked *unless* OmniRoute's key-reveal setting is on, in which case it is the raw key. `providerSpecificData` may hold secrets. **The server part must delete `apiKey`, `accessToken`, `refreshToken`, `idToken` and `providerSpecificData` before anything reaches the browser.** |
| R | `GET /api/providers/{id}` | One connection. The same stripping applies. |
| W | `PATCH /api/providers/{id}` | `updateProviderConnectionSchema`. The plugin sends only `{isActive: boolean}`. It never sends `apiKey` or the other fields. |
| R | `GET /api/providers/health-matrix` | Health per provider and connection. |
| R | `GET /api/providers/quota-windows` | Quota windows. |
| R | `GET /api/providers/health-autopilot?provider&includeHealthy&includeActions` | OmniRoute's own health report with suggested actions. Shown to the user and used by the autopilot. |
| R | `GET /api/providers/expiration` | Credential expiry. |

### Usage, logs and latency

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /api/usage/history` | `getUsageStats()` (cached analytics). Feeds Overview and Usage. |
| R | `GET /api/usage/call-logs?status&model&provider&account&apiKey&combo&search&correlationId&limit&offset&excludeTests=1` | **Feeds Recent routing and per-turn matching.** Each row has `id, timestamp, status, model` (served), `requestedModel, provider, providerDisplay, account, connectionId, duration` (ms), `tokens{in,out,cacheRead,cacheWrite,reasoning,compressed}, apiKeyId, apiKeyName, comboName, comboStepId, comboExecutionKey, error, correlationId, cacheSource, resilienceActions, sessionTag, clientSessionId, modelPinned, knownTierCostUsd`, and live rows carry `active`. **`apiKey=` matches the key's name or id**, so filtering to LearnHarness's own key works. Bodies are not in the list (only `hasRequestBody`/`hasResponseBody`). |
| R | `GET /api/usage/call-logs/{id}` | One row's detail. **The plugin never shows request or response bodies** (prompts may be private). It shows metadata only. |
| R | `GET /api/usage/model-latency-stats?windowHours&minSamples&maxRows&model&provider` | Per-model latency. |
| R | `GET /api/usage/logs` | The 200 most recent log lines. |
| R | `GET /api/usage/request-logs` | Not checked in detail; the plugin prefers `call-logs`. |
| R | `GET /api/usage/{connectionId}` | Usage for one connection. |
| R | `GET /api/usage/cache-health`, `GET /api/cache/stats` | Cache section. |
| R | `GET /api/usage/quota`, `/provider-limits`, `/utilization`, `/budget`, `/token-limits`, `/key-quota` | Quota and limit cards. The autopilot also uses these to account for other clients' load on shared quotas. |
| R | `GET /api/pricing` | Prices per model. |

### Keys

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /api/keys` | The list returns `key: maskStoredApiKey(...)`. Strip it anyway, and show only name, scopes, created and last-used. |
| — | `POST/PUT/DELETE /api/keys*` | Not used (BRIEF 4.5: no key writes). `POST` returns the raw new key. |

### Explorer discovery

| Use | Method & path | Notes (verified) |
|---|---|---|
| R | `GET /api/openapi/spec` | The handler has **no auth check of its own**; the central policy applies. It returns `{info, servers, tags, endpoints:[{method, path, tags, summary, description, security, parameters, requestBody, responses, loopbackOnly, alwaysProtected, internal}], schemas}`. The Explorer lists only `GET` endpoints, hides `internal` and `loopbackOnly` ones, and applies the denylist. |
| — | `POST /api/openapi/try` | Never used (BRIEF 4.7). |

### Possibly relevant, check before using

- `GET /api/context/combos/{id}/assignments` (with `PUT`) and `GET /api/context/combos/default`: may assign combos to clients or keys. If they bind a combo to LearnHarness's key, the autopilot could route by key rather than by model name. Read the handlers before planning around this.
- `GET /api/usage/route-explain/{id}`, `GET /api/usage/combo-health-autopilot`, `GET /api/usage/combo-scoring-inspector`, `GET /api/usage/combo-forecast`: richer routing insight, candidates for the Routing tab.
- `GET /api/routing`, `GET /api/fallback`, `GET /api/resilience*`: global routing and fallback settings. **Read-only**, because they are shared with other OmniRoute clients (BRIEF 4.6, point 6).

### First-run bootstrap (managed mode, decision 9)

Verified in the v3.8.54 source; check the exact session and CSRF handling on a live instance.
1. `GET /api/settings/require-login` returns `{requireLogin, hasPassword, setupComplete, …}`. If there is no password and `setupComplete` is false, OmniRoute is in the **bootstrap window**: loopback callers need no auth (`isAuthRequired`).
2. `POST /api/settings/require-login` `{password, requireLogin: true}` (`updateRequireLoginSchema`, password ≥4 chars). This is allowed inside the bootstrap window. After it, auth is on.
3. `POST /api/auth/login` `{password}` returns a dashboard session cookie. There may also be a CSRF step (`/api/auth/csrf`); verify.
4. `POST /api/keys` `{name: "LearnHarness plugin (manage)", scopes: ["manage"]}` with the session. **A manage-scope key always needs a real credential** (`requireCredentialForManagementScopedKey` → `alwaysRequireAuth`), which is why the password and login come first. The response holds the raw `key` **once**.
5. `POST /api/keys` `{name: "LearnHarness"}` creates the inference key (no manage scope).
6. `POST /api/auth/logout`. From then on the plugin uses only the manage key.

Not used: OmniRoute's local CLI machine token (`isCliTokenAuthValid`) is internal to its CLI.

## Explorer denylist (never fetched, even if listed by the spec)

Path prefixes: `/api/keys` (except the masked list, which is stripped anyway), `/api/oauth`, `/api/auth`, `/api/db`, `/api/db-backups`, `/api/log-export`, `/api/tunnels`, `/api/vnc-session`, `/api/shutdown`, `/api/restart`, `/api/sync`, `/api/cloud`, `/api/settings` (may hold credentials), `/api/cli-tools`, `/api/openapi/try`, `/api/usage/call-logs/{id}` (has bodies), `/api/{...omnirouteApiCatchAll}`. Also anything streaming (`text/event-stream`), and `/v1/*` inference routes.

On top of that, every Explorer response is recursively redacted for fields named like `key`, `apiKey`, `token`, `accessToken`, `refreshToken`, `idToken`, `secret`, `password`, `authorization`, `cookie`, `credential` or `providerSpecificData`, and capped in size.

## Still to verify on a live instance

1. The `/api/usage/history` payload shape (built by analytics code; read it on a live instance).
2. How a call-log row links to a combo-trace `invocationId` (`comboExecutionKey`? `correlationId`?).
3. Whether `/api/openapi/spec` is reachable with a manage key under the central policy (expected yes).
4. That `combos/builder/options` exposes the accepted strategy list.
5. Behaviour on older OmniRoute releases: the plugin must treat any 404 as "not available on this OmniRoute version" and hide that section, not fail.
