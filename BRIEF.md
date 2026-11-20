# Brief: an OmniRoute plugin for LearnHarness

You are building a **Community plugin for LearnHarness** that lets the user **manage** how LearnHarness's agent traffic is routed through **OmniRoute**, and that shows **as much of OmniRoute's own information as possible** inside the app. The plugin lives in its own repository: the directory you are running in.

**Owner's stated purpose:** the plugin should manage the agent routing as far as the plugin API allows, and surface as much information from OmniRoute (the app LearnHarness routes through) as possible. When choosing between a smaller and a larger scope in this brief, prefer the larger, provided it stays inside the hard constraints in section 1.

Read this whole brief before writing code. Where a decision is marked **ask the owner**, stop and ask; do not guess.

---

## 1. Goal and hard constraints

**Goal.** A LearnHarness user who routes their models through OmniRoute can:
- set OmniRoute up for LearnHarness from inside the app;
- **control LearnHarness's routing from the plugin**: which models and providers serve each LearnHarness role (Strong, Cheap, Vision), in what order, and with which strategy, by managing OmniRoute combos (see "The routing lever" below);
- see everything useful that OmniRoute's API exposes (usage, cost, latency, combos, providers, connections, quotas, cache, pricing, keys metadata, health, recent routing decisions) without leaving LearnHarness.

**The routing lever.** The plugin cannot change LearnHarness's model settings, but it does not need to. LearnHarness's Strong, Cheap and Vision models are set once to **OmniRoute combos** (for example `OmniRoute-Strong`, `OmniRoute-Cheap`, `OmniRoute-Vision`; final names are decided with the owner). From then on, editing those combos in OmniRoute through its management API changes what actually serves LearnHarness's agents, with no change in LearnHarness. Build the plugin around this:
- the set-up guide offers to **create** these combos (after confirmation) and tells the user to select them in LearnHarness;
- the main view lets the user **edit** them: reorder models, add or remove models, change strategy, and enable or disable provider connections they rely on;
- the view shows, for each LearnHarness role, which combo it uses and what last actually served it.

**Hard constraints**
- **Works on every LearnHarness version from the original v0.6.1 onwards.** That covers the upstream project and any fork. Use **only** plugin API v1 as it exists in v0.6.1.
  - Manifest: `"apiVersion": 1`, `"minAppVersion": "0.6.1"`.
  - Do not use anything added later. Known example: the `sync-changed` server event exists only in a fork.
  - When in doubt, check the API against the v0.6.1 docs.
- **Public plugin API only.** Use type-only imports from the SDK. Never import private LearnHarness modules, and never call LearnHarness's own `/api/*` routes.
- **The plugin is not a model provider, and cannot become one.** The plugin API has no provider registration and no access to provider settings or credentials. It cannot switch LearnHarness's model settings, hide LearnHarness's provider or agent settings, or see the teacher's individual model requests and responses.
- **Traffic reaches OmniRoute through LearnHarness's built-in "Custom endpoint" provider,** pointed at OmniRoute. The user configures that by hand once; it exists in v0.6.1. The plugin *guides* this setup, *manages routing on the OmniRoute side* (combos, connections), and *displays* OmniRoute data.

---

## 2. Background

**OmniRoute** is an open-source (MIT) AI gateway. These facts come from its README and `docs/reference/API_REFERENCE.md`, partly via a summary. **Verify every endpoint and field against the OmniRoute clone before relying on it.**
- **Inference address:** one OpenAI-compatible base, `http://<host>:20128/v1` by default. It authenticates with `Authorization: Bearer <OmniRoute key>`.
- **Models and combos:** `GET /v1/models` lists models *and combos* (fallback chains), so a combo can be selected like a model. Models are provider-prefixed (e.g. `cc/claude-opus-4-6`); built-in virtual combos include `auto/coding`, `auto/fast` and `auto/cheap`.
- **Routing headers on replies:**
  - `X-OmniRoute-Decision: strategy=<name>; provider=<alias>; latency_ms=<n>`
  - `X-OmniRoute-Provider`, `X-OmniRoute-Model`, `X-OmniRoute-Tokens-In`, `X-OmniRoute-Tokens-Out`, `X-OmniRoute-Response-Cost`
  - `X-OmniRoute-Fallback-Attempts`, `X-OmniRoute-Cache-Hit`

  The plugin **cannot** see these on the teacher's requests; they are listed only for context.
- **Management API:** needs a dashboard session, or a key with the **manage/admin scope**. Inference-only keys get 403. Routes:
  - `/api/usage/history`, `/api/usage/logs`, `/api/usage/request-logs`, `/api/usage/model-latency-stats`, `/api/usage/[connectionId]`, `/api/usage/cache-health`
  - `/api/combos*`, `/api/providers*`, `/api/keys*`, `/api/pricing`, `/api/cache/stats`
  - Self-service usage: `GET /api/usage/om-usage?format=json`
- **Not confirmed:** the field layout of the request logs, whether a health or version endpoint exists, and the exact methods and bodies for **writing** combos and provider connections (create, update, reorder, enable/disable, delete). Read the clone.

**First task: an endpoint inventory.** Before designing screens, read the OmniRoute clone's API reference *and* its route handlers (the source is authoritative where they differ) and write `docs/omniroute-endpoints.md` in this repo. For each `/api/*` and `/v1/*` route list: method, path, required scope, request body, response shape, and whether the plugin will use it (read, write, or not used, with the reason). Show this to the owner together with the first decision question. Every read endpoint that gives the user useful information should end up in the view unless the owner says otherwise.

**LearnHarness plugins** are trusted local code with two parts:
- **Server part:** a CommonJS module that runs in the app's Node server, so it can make network calls.
- **Browser part:** an ES module that runs in the app page.

Each plugin has its own data folder, `ctx.dataDirectory`, written as plain files. **There is no secrets storage in v0.6.1.**

---

## 3. Workspace setup (one-time)

The owner will provide or create these folders. Work in the plugin repo, and read the other two:

| Folder | Role | Write? |
|---|---|---|
| this repo, e.g. `learnharness-omniroute` | the plugin | **yes** |
| a plain clone of OmniRoute | API reference: `docs/reference/API_REFERENCE.md`, source of the `/api/*` routes | read only |
| the LearnHarness **authoring skill**: in the app, Settings → Community plugins → **Download authoring skill**, extracted | plugin SDK `types/`, `SKILL.md`, docs, example plugins | read only |
| optional: a LearnHarness checkout | `docs/plugin-authoring.md`, `docs/plugin-api/`, `plugins/` examples | read only |

**On the owner's machine (WSL), these already exist side by side:**
- `/home/joaol/OmniRoute-lh`: this plugin repo;
- `/home/joaol/OmniRoute`: shallow clone of upstream `cheaper-inference/OmniRoute` (tip `a6126184`, 2026-11-20); routes are under `src/app/api/`, docs under `docs/reference/`;
- `/home/joaol/learnharness`: the LearnHarness checkout.

- `/home/joaol/OmniRoute-lh/learnharness-plugins`: the extracted authoring skill (bundle for app **0.6.4**, plugin API 1). It sits inside this repo but is **git-ignored and must never be committed**: the plugin needs it only at build time, for type-only imports and typechecking. Point `tsconfig` at `./learnharness-plugins/types` and say in the README that contributors download the skill themselves. Because the bundle is from 0.6.4, check anything you use from it against the v0.6.1 baseline (`git -C /home/joaol/learnharness show cb25c8e:<path>`).

A LearnHarness 0.6.1 installer is in the owner's Downloads folder for the compatibility test.

**Already checked in the clone** (still confirm bodies and scopes): `src/app/api/combos/` has `GET/POST` on the collection, `GET/PUT/PATCH/DELETE` on `[id]`, plus `reorder`, `duplicate`, `test`, `metrics`, `auto`, `import`/`export` and `builder/options`. `src/app/api/providers/` has `GET/POST/PATCH/DELETE`, `[id]` with `GET/PUT/PATCH/DELETE`, and read routes such as `health-matrix`, `quota-windows` and `expiration`. There is an `src/app/api/health` route. Also look at `src/app/api/context/combos/` (including `[id]/assignments` and `default`), which may allow routing per client or key. The API surface is large, so put routing-related and LearnHarness-relevant routes first in the inventory.

Add the read-only folders to the session with `/add-dir <path>`. Start by reading the skill's `SKILL.md`, then its plugin authoring guide.

If a LearnHarness checkout is available, the guide as it was in v0.6.1 is `git show cb25c8e:docs/plugin-authoring.md`. Treat it as the compatibility baseline.

---

## 4. What the plugin provides

### 4.1 Settings page (`registerSettings`)
- **OmniRoute address:** base URL, default `http://localhost:20128`.
- **Management key:** must have the manage scope, and must be separate from the key LearnHarness uses for inference.
- **Optional: the inference key LearnHarness uses.** Used only to filter request logs down to LearnHarness's own calls, if OmniRoute's logs identify keys. Verify that first.
- **Test connection**, showing what was reached and the OmniRoute version if available.
- **Refresh interval** for the dashboard.
- Validate every input in the server part too. Never send the key to the browser part after it is saved; show it masked.

### 4.2 "Set up OmniRoute" guide (a view or dialog)
Step by step, with a copy button for the address:
1. In OmniRoute: create an inference key for LearnHarness, and a separate manage-scoped key for this plugin.
2. In LearnHarness: Settings → Providers → **Custom endpoint**. Base URL `http://<host>:20128/v1` (LearnHarness does not append `/v1`), mode **API key**, the inference key.
3. Optionally let the plugin **create the LearnHarness combos** (one per role), starting from a sensible default chain the user can edit first. Show exactly what will be created and ask for confirmation. Skip any that already exist.
4. Connect, then pick those combos for the Strong, Cheap and Vision models.
5. List all combos the plugin found (from `/v1/models` or `/api/combos`), marking the LearnHarness ones, so the user knows which names to pick.
6. Ask the user which combo they assigned to each role, and remember it (the plugin cannot read LearnHarness's settings). The view uses this mapping.

### 4.3 OmniRoute view (`registerView`, plus a sidebar action via `registerAction` + `placeAction`)
Sections, each fed by the server part:
- **Routing (LearnHarness roles):** for Strong, Cheap and Vision: the combo assigned, its strategy and ordered models, what served the last requests, and fallback rate. Editing controls live here (see 4.5).
- **Overview:** OmniRoute version and health, today's and this period's requests, tokens and cost; cache hit rate.
- **Usage over time:** a chart of requests, tokens and cost, with breakdown by provider and model.
- **Models:** latency (e.g. p50/p95 if available) and error stats per model, and pricing from `/api/pricing`.
- **Combos:** every combo with its strategy and ordered models, editable (4.5).
- **Providers and connections:** each connection's status, per-connection usage and quota or rate-limit information where OmniRoute exposes it, with an enable/disable control (4.5).
- **Cache:** `/api/cache/stats` and `/api/usage/cache-health`.
- **Keys:** key metadata only (name, scope, created, last used, usage) if the API returns it. Never display or log key secrets.
- **Recent routing:** the latest requests, filterable to LearnHarness's own key. For each: time, requested model or combo, provider and model that actually served it, fallback attempts, latency, tokens, cost, cache hit. Clicking a row shows every field the log gives.
- **Anything else** the endpoint inventory finds useful that is not listed here.

### 4.5 Routing management (write actions)
In scope by the owner's stated purpose. Exact list confirmed in decision 5. Candidates:
- create, edit, reorder and delete combos; change a combo's strategy;
- enable or disable provider connections;
- any other routing-related setting the inventory finds (e.g. default strategy, fallback or retry settings).

Rules for every write:
- server part only, with the management key; validate input in the server part before sending;
- show a confirmation that says exactly what will change (before → after); deletes and anything that affects a combo assigned to a LearnHarness role get an extra warning;
- after writing, re-read the object from OmniRoute and show the real result; on failure, show OmniRoute's error in plain words and change nothing locally;
- keep a local log of the plugin's own changes (time, object, before, after) in `ctx.dataDirectory`, viewable in the plugin, so a change can be undone by hand;
- no writes to keys (creating, revealing or revoking keys) unless the owner explicitly asks for it in decision 5.

**Refresh:** on open, on an interval while the view is mounted, and after each teacher turn (`turn-settled` event, available in v0.6.1).

### 4.6 Automatic routing ("autopilot")
The owner wants the plugin to **set up and keep maintaining LearnHarness's routing automatically**, taking into account the models and agents the user has already connected, and **always preferring the models the user tied to the app**.

**What the plugin can read (verified in v0.6.1, `cb25c8e`).** In the server part, `ctx.inference.catalog()` returns the host's last-known `ModelCatalogResponse`:
- `slots`: the resolved **strong / cheap / vision** models;
- `rolePins`: the resolved model for each background role (`researcher`, `demoBuilder`, `visualMaker`, `extractor`, `auditor`, `sideQuestion`); the teacher and prober use the strong slot;
- `defaults`: the conversation default (from strong);
- `providers`: each connected provider with `keyPresent` (an empty `envVar` means a subscription or native CLI route);
- `models`: every available model, with input types (text/image), reasoning, context window and cost.

This is read-only. It cannot change LearnHarness settings or see credentials. A single chat can also set its own model. The catalog does not show that, but `ctx.learning.getSession(chatId).settings.model` does, also in v0.6.1. Read it on `turn-settled`, and warn when a chat bypasses the `OmniRoute-*` combos.

**How it works**
1. **Snapshot the user's choices first.** Before the user switches anything to OmniRoute, read the catalog and save the user's **preferred models** per slot and role in `ctx.dataDirectory`. This is needed because after the switch the catalog shows only `custom/<combo>` ids, not the original models. The user can edit this list in the plugin later.
2. **Match to OmniRoute.** Map each preferred LearnHarness model (`provider/id`) to OmniRoute models from `/v1/models` and the provider connections. Exact matches come first; for close matches (same model family through another provider, e.g. a subscription route) ask the user to confirm. List any model that has **no** OmniRoute connection, and tell the user which provider to connect in OmniRoute. The plugin cannot copy LearnHarness credentials into OmniRoute.
3. **Build the combos.** For each slot, and each role that has its own override, create or update a plugin-owned combo (e.g. `OmniRoute-Strong`). Put the user's preferred model(s) **first**, then fallbacks that meet that slot's needs: vision needs image input; strong prefers reasoning models and large context; cheap prefers low cost. Default strategy is `priority`, so the preferred model is always tried first and fallbacks only take over on failure, quota or cooldown. Show the plan once and apply it after the user confirms.
4. **One manual step.** The user points LearnHarness's slots and role overrides at the Custom endpoint's combo ids. The guide walks through it, then reads the catalog again to **check** that it was done (slots now resolve to `custom/OmniRoute-*`).
5. **Keep iterating.** OmniRoute handles each request: fallback, cooldowns, quota and health. The plugin adds a **reconcile loop** on an interval, on `turn-settled`, and when the view opens:
   - re-read the catalog and notice changes (a new provider connected in LearnHarness, a slot changed back to a native model, a new role override). v0.6.1 has no settings-changed event, so poll;
   - read OmniRoute's data (`/api/combos/metrics`, model latency, `providers/health-matrix`, `quota-windows`, `health-autopilot`, `combos/auto` candidates);
   - re-rank **only the fallback tail** of each `OmniRoute-*` combo by health, latency, error rate, quota left and cost; add healthy candidates and drop dead ones;
   - **never** move the user's preferred models out of first place. If a preferred model keeps failing, OmniRoute falls back by itself. The plugin then tells the user instead of demoting the model on its own.
6. **Respect other users of OmniRoute.** Other clients (Claude Code, Cursor, other keys) may share the same OmniRoute. The autopilot only changes combos the plugin created, tracked by id in its data file. Shared resources (provider connections, global settings) are never changed automatically. When ranking, take other clients' load on shared quotas into account, using OmniRoute's quota and usage data.

**Guardrails**
- Autopilot is **off until the user turns it on**, and there are two levels:
  - **suggest:** shows proposed changes and the user applies them;
  - **auto:** applies changes to `OmniRoute-*` combos within the rules above.
- Every automatic change goes in the change log (4.5), with one-click revert, and a short notice in the view.
- There is a rate limit, so the plugin doesn't change combos constantly: a minimum interval between changes, and a change only when the improvement passes a threshold.
- Any write outside `OmniRoute-*` combos still needs explicit confirmation.

**Disclosure of the one manual step (required).** The plugin can do everything else, but only the user can point LearnHarness's model settings at the `OmniRoute-*` combos. Say this plainly and early, everywhere it matters:
- **README:** near the top, in a short "One manual step required" box: what to change in LearnHarness (Settings → Providers → Custom endpoint, then the Strong/Cheap/Vision models and any role overrides set to the `OmniRoute-*` combos), why the plugin can't do it (the plugin API can't change LearnHarness settings), and that it is needed only once.
- **Plugin description in the manifest** and the **settings page:** one sentence saying the same.
- **Set-up guide:** a dedicated step with the exact values to pick and copy buttons, then an automatic check through the catalog.
- **Main view:** until the check passes, a persistent banner: "Routing is not active yet: LearnHarness still uses <models>. Complete the one manual step." with a button that opens the guide. If the check later fails again (the user switched a slot back), the banner returns and names which slot or role.
- Never claim routing is active, or that the autopilot is working, unless the check passes.

Optional, ask the owner first: the strategy for the fallback tail (e.g. `adaptive`, `latency`, `cost-optimized`, `quota-weighted`; check the list OmniRoute accepts), and whether OmniRoute's own `auto/*` virtual combos may be used as the last fallback.

### 4.7 Data explorer: every other OmniRoute dataset
The owner wants **all** the data OmniRoute provides to be viewable in the app. Upstream OmniRoute has about 485 readable (`GET`) routes across ~100 areas (analytics, monitoring, quota, rate-limits, resilience, routing, fallback, cache, compression, sessions, provider-metrics, provider-stats, free-tier, evals, telemetry, …). Building a screen for each one is not realistic, so there are two layers:
1. **Curated sections** (4.3) for the important data, with charts and plain-language labels.
2. **An Explorer tab** for everything else. It is generic, so it adapts to whichever OmniRoute version the user runs:
   - **Discovery:** call the running OmniRoute's `GET /api/openapi/spec` (it returns the server's own `openapi.yaml` as a JSON catalog; in the current clone it covers ~771 paths). Verify its response shape and auth in the clone. If it's missing or fails, fall back to a list bundled with the plugin, built from the endpoint inventory.
   - **Browsing:** endpoints grouped by area, with search. Selecting one shows its summary and any query parameters as a form; path parameters are filled from pickers (e.g. combo id, connection id) built from other reads.
   - **Rendering:** arrays of objects as sortable tables, number series as a simple chart, everything else as a collapsible tree. There is always a "raw JSON" view, and data can be copied.
   - **Read-only:** only `GET`. The Explorer never sends `POST`/`PUT`/`PATCH`/`DELETE`, and never uses OmniRoute's `/api/openapi/try` proxy. Writes happen only through the controlled actions in 4.5/4.6.
   - **Safety:**
     - a denylist of endpoints that can return secrets or heavy data: keys reveal or export, OAuth/tokens, `db`/`db-backups`, `log-export`, settings that hold credentials, `vnc-session`, `tunnels`, `shutdown`/`restart`, and anything streaming;
     - on top of that, redact any field whose name looks secret (`key`, `token`, `secret`, `password`, `authorization`, `cookie`), whatever the endpoint;
     - response size limit and timeout;
     - all text inserted as text, never HTML.
   - **Promotion:** an Explorer item can be pinned to the main view as a small card. That way the user can build their own extra dashboard sections without new plugin code.

### 4.8 Managed OmniRoute (install, start with the app, stop with the app)
The owner wants the plugin to manage the OmniRoute installation: install it on first use, start its server when LearnHarness opens, and stop it when LearnHarness closes. The server part is trusted Node code, so this is possible with Node built-ins (`child_process`, `fs`). The LearnHarness plugin API provides nothing extra for it, and none is needed.

**Facts this design rests on (verified)**
- **LearnHarness desktop** (`electron/main.cjs`) runs its server as a child process: `process.execPath` with `ELECTRON_RUN_AS_NODE=1`. On quit it sends `SIGTERM`, then `SIGKILL`. **On Windows, `child.kill()` terminates the process immediately, so the plugin's `cleanup` probably never runs when the app closes**, and Windows does not kill a process's children when it dies. Stopping OmniRoute on app close therefore **cannot rely on `cleanup`** (see "watchdog" below). Confirm this on a real Windows install.
- **Don't run OmniRoute with LearnHarness's own runtime.** `process.execPath` is Electron. OmniRoute's native modules (`better-sqlite3`, …) are built for the system Node's ABI, so OmniRoute must run on the **system Node** (the one its npm install used).
- **OmniRoute CLI** (v3.8.54, `bin/cli/commands/`):
  - `omniroute serve [--port <p>] [--no-open] [--headless] [--daemon] [--log]` is the default command;
  - `omniroute stop [--port <p>]` (uses a PID file);
  - `omniroute status`, `omniroute health`, `omniroute doctor`, `omniroute autostart`.
- **Environment** (`docs/reference/ENVIRONMENT.md`):
  - `PORT` (default 20128) and `DATA_DIR` (default `~/.omniroute/`);
  - `JWT_SECRET` and `API_KEY_SECRET` are auto-generated and persisted by OmniRoute when unset;
  - `INITIAL_PASSWORD` sets the dashboard password on first start;
  - `REQUIRE_API_KEY` makes `/v1/*` require a key.
- **First-run bootstrap.** On a fresh install (no password, setup not complete), `isAuthRequired` lets **loopback** callers through (`src/shared/utils/apiAuth.ts`). A plugin on the same machine can therefore create the two API keys it needs (LearnHarness inference key + manage key) through `POST /api/keys` before any password exists. Then it either sets a password or asks the user to. Verify the exact onboarding calls in the clone; this is a one-time, user-confirmed action and the only key write the plugin ever makes.
- **npm 11 blocks install scripts by default.** A plain `npm install -g omniroute` skips OmniRoute's `postinstall`, which copies the platform's native SQLite and TLS binaries into its standalone build. Without it, OmniRoute fails on Windows. Any install the plugin performs must pass `--allow-scripts=omniroute,keytar,onnxruntime-node,@parcel/watcher,@swc/core,protobufjs,esbuild` (the list npm printed for 3.8.54; read it from npm's output rather than hard-coding it).

**Modes** (setting: "How is OmniRoute run?")
1. **External:** OmniRoute is run by the user (Docker, another machine, already running). The plugin only connects. It never installs, starts or stops anything.
2. **Managed by the plugin:**
   - **Detect:** on server activation, check `GET <address>/api/health`. If OmniRoute is already running and the plugin didn't start it, treat it as external for this session: use it, and never stop it.
   - **Install** (first use, only after the user confirms in the set-up guide, with a progress log):
     - find the system `node`/`npm` (Windows: `where node`, `where npm`; else `which`); if missing, explain and link to nodejs.org instead of failing silently;
     - install with `npm install -g omniroute@<pinned or latest> --allow-scripts=…`, or into a plugin-owned prefix outside the LearnHarness data folder (e.g. `%LOCALAPPDATA%\omniroute-lh\runtime`), so ~1,300 packages are never copied by Device Sync. **Ask the owner which.**
     - afterwards run `omniroute --version` and `omniroute doctor`, and show the result.
   - **Start** (on server activation): spawn the system `node` with the installed `bin/omniroute.mjs serve --port <port> --no-open --headless`, `ELECTRON_RUN_AS_NODE` removed from the env, output to a rotating log in plugin data, `windowsHide: true`. Wait for `/api/health`, then for `/api/monitoring/health` with the key.
   - **Stop:**
     - plugin `cleanup` runs `omniroute stop --port <port>`, then kills the child it spawned. This works on disable and on clean shutdowns;
     - **watchdog for app close:** OmniRoute is launched through a tiny supervisor script shipped in `dist/`. The supervisor is passed the LearnHarness server's PID, checks it every ~2 s, and stops OmniRoute when that PID is gone. This covers Windows, where `cleanup` doesn't run;
     - **stale-instance recovery:** a PID file in plugin data. On the next activation, if an orphan the plugin started is still running, adopt it or stop it.
   - **Option "Keep OmniRoute running after LearnHarness closes"** (off by default). Turn it on when other tools (Claude Code, Cursor, …) also use this OmniRoute, because stopping it would break them. The plugin also warns before stopping if the call logs show other clients used it recently.
   - **Status** on the settings page and Overview: not installed / installing / starting / running (version, PID, port) / stopped / crashed (last log lines). Buttons: Start, Stop, Restart, Open OmniRoute dashboard, View log.
   - **Updates:** show when a newer `omniroute` version exists (`npm view omniroute version`). Update only on the user's click (stop, install, start), never automatically.

**Secrets in managed mode.** The plugin does **not** set `JWT_SECRET` or `API_KEY_SECRET`. When they are unset, OmniRoute generates them once and persists them in its own data folder (`src/instrumentation-node.ts`). With the shared `~/.omniroute` (decision 8), passing different values would break keys and sessions created by the user's other OmniRoute runs. The dashboard password (decision 9) is stored with the management key in plugin data. Nothing secret is passed on the command line.

**Ask the owner:**
- the default mode;
- install target (global npm vs a plugin-owned prefix);
- OmniRoute `DATA_DIR`: share the default `~/.omniroute` with other uses of OmniRoute, or use a plugin-owned one;
- whether the plugin may set the dashboard password itself (shown once to the user) or the user sets it in OmniRoute's dashboard;
- whether managed mode is part of the first release.

### 4.4 Explicitly out of scope
Do not implement these; they are impossible as a plugin:
- replacing or hiding LearnHarness's provider or agent settings;
- changing which model or combo LearnHarness's settings point at (the user does that once by hand; the plugin changes what the combo routes to instead);
- badges **inside** chat messages (the plugin can't draw into the native transcript). The per-turn routing panel in 5.1 is the substitute.

Editing OmniRoute's configuration **is** in scope (section 4.5); which actions exactly is decision 5.

---

## 5. Architecture rules

### 5.1 Native implementation map (plugin API v1, as in v0.6.1 `cb25c8e`)
Every feature maps onto a documented v0.6.1 extension point. Nothing here needs host changes. Check each against the v0.6.1 guide (`git -C /home/joaol/learnharness show cb25c8e:docs/plugin-authoring.md`) and the SDK types before use.

**Server part (`dist/backend.cjs`, `activate(ctx)`, once per server)**

| Job | API |
|---|---|
| All OmniRoute HTTP calls (fetch with timeout, aborted on `ctx.signal`) | Node `fetch` inside handlers |
| Browser → server operations: `settings.get/save/test`, `overview`, `usage`, `combos.list/write`, `providers.*`, `explorer.spec`, `explorer.get`, `autopilot.status/plan/apply/revert`, `turnRouting` | `ctx.handle(name, handler)` (JSON only) |
| Read the user's models: slots, role pins, providers, models | `ctx.inference.catalog()` |
| Read a chat's own model override, and its turn usage (`at`, `model`, token steps) | `ctx.learning.getSession(id)`, `listSessions()` |
| React to teacher/practice turns: refresh, reconcile, match turn ↔ OmniRoute log | `ctx.events.on("turn-settled" \| "turn-started" \| "chats-changed")` |
| Push live updates to open views ("routing changed", "autopilot applied X", "manual step not done") | `ctx.events.emit(topic, data)` → browser `onNotification`; on reconnect use `onResync` and re-fetch |
| Autopilot reconcile timer | `setInterval` started in `activate`, cleared in `ctx.cleanup`, checking `ctx.signal` after every await |
| Settings, preferred-model snapshot, owned-combo ids, change log, pinned explorer cards | atomic JSON files in `ctx.dataDirectory`, each with a version field; do not use the reserved `data/agents/`, `data/tasks/`, `data/usage.jsonl` |

**Browser part (`dist/main.js`, `activate(ctx)`, once per window)**

| Feature | API |
|---|---|
| Main "OmniRoute" screen with tabs: Routing, Overview, Usage, Models, Combos, Providers, Cache, Keys, Recent routing, Explorer, Change log | `ctx.registerView({ id: "omniroute", mount(container, signal) })`; the plugin draws its own tab strip inside the view body; the host owns the top bar and settings gear |
| Sidebar entry | `registerAction({ id: "open-omniroute", run: () => ctx.app.openView("omniroute") })` + `placeAction({ location: "sidebar" })` |
| Keyboard shortcut (optional) | `shortcut: { scope: "app" }` on that action, unbound by default |
| **Routing for this chat**: per-turn panel listing each turn's time, requested combo, provider and model that actually answered, fallbacks, latency and cost | action placed with `location: "top-bar", sessions: ["teaching", "practice"]`; `run(context)` reads `context.sessionId` and calls `ctx.call("turnRouting", { chatId })`, then shows the result in `ctx.ui.openSurface` (or `openDialog`) |
| Quick actions on the view's own top bar (Refresh, Autopilot on/off, Open guide) | `placeAction({ location: "top-bar", views: ["omniroute"] })`, with a `disabled` predicate + `ctx.refreshActions()` |
| Settings page: address, management key (masked), optional LearnHarness inference key, refresh interval, autopilot level | `registerSettings({ mount })` using `ctx.ui.mountSettingsRows` (`text`, `dropdown`, `number`, `toggle`) + `mountButton` "Test connection"; rows are updated only after the server confirms the save |
| Set-up guide with the one manual step and its live check | `ctx.ui.openSurface` (multi-step body); copy buttons via `mountButton`; text via `mountMarkdown` |
| Confirmations (before → after) for writes and autopilot plans | `ctx.ui.openDialog` with plugin-built content |
| "Not active yet" banner, status chips (healthy / cooldown / quota), autopilot state | plugin DOM + `ctx.ui.mountBadge` |
| Pick a LearnHarness model when editing the preferred-models list | `ctx.ui.mountModelPicker` (reads the host catalog and changes no core setting) |
| Combo editor (ordered models, strategy) and Explorer endpoint tree | `ctx.ui.mountTree` for hierarchies, plugin DOM for reorder and forms, `openMenu` for row actions |
| Explanatory text, tables of small data | `ctx.ui.mountMarkdown` (host renderer, with tables) |
| Charts | plain inline SVG drawn by the plugin (no host chart widget) |
| Live refresh | `ctx.onAppEvent("turn-settled")` + plugin `onNotification` topics; timers tied to the view's per-mount `signal` |
| Styles | `dist/styles.css`, every rule scoped under the plugin's root class; colours from `--foreground`, `--background`, `--border` |

**Per-turn matching (how "Routing for this chat" works).** For each `TurnUsage` in the chat record: `model` names the combo (e.g. `custom:OmniRoute-Strong`), `at` gives the time, and `steps` gives the per-call token counts. Match each step to OmniRoute request-log rows by combo or model name, a time window around `at`, the key (if filtering by LearnHarness's key works), and input/output tokens. Show a confidence label (exact or likely). If nothing matches, say so instead of guessing. Cache matches in plugin data. Verify the request-log fields in the clone first (section 2).

**Optional, ask the owner first:** `registerTools({ agents: ["teacher"], ... })` could give the teacher a read-only tool such as "check OmniRoute status", and `registerInstructions` could add a line about it. This is off by default: it changes the teacher's behaviour and uses tokens.

**Not available in v0.6.1, so do not use:** drawing into native chat messages, changing core settings, custom HTTP routes, the fork-only `sync-changed` event, and anything listed in "Deliberate limits".

- **All OmniRoute calls happen in the server part** (`backend.cjs`). The browser part talks to it only through `ctx.call(name, input)`, handled by `ctx.handle(...)`. Reasons:
  - the key never reaches the page;
  - no browser cross-origin (CORS) problems;
  - the browser part never touches the network directly.
- **Data access:**
  - Use only the documented OmniRoute endpoints, with timeouts, abort on `ctx.signal`, and clear errors in plain words: unreachable, 401/403 (wrong or inference-only key), unexpected shape.
  - Treat every OmniRoute response as untrusted: check its shape before use, and insert text safely (no raw HTML).
- **Settings storage:** keep them in `ctx.dataDirectory`, using atomic writes, with a version field in the file.
- **UI:**
  - Use host widgets where they fit (`ctx.ui.mountSettingsRows`, `mountButton`, `mountBadge`, `mountMarkdown`, `openDialog`) and the theme variables (`--foreground`, `--background`, `--border`, …).
  - Charts: plain SVG, or a small bundled library. The host provides no chart widget.
  - Scope all CSS to the plugin's own root element.
- **Cleanup:** follow the lifecycle rules (`signal`, `cleanup`). Stop timers when the view unmounts or the plugin is disabled.
- **Package layout:**
  - `dist/manifest.json`, `dist/main.js`, `dist/backend.cjs`, optional `dist/styles.css`;
  - bundle dependencies;
  - preserve the sibling `data/` folder on rebuilds;
  - `id` is lowercase with hyphens and matches the install folder name, e.g. `omniroute`. **Ask the owner** for the final id and name.

---

## 6. Decisions to ask the owner (one question at a time)

1. **Plugin id and display name** (e.g. `omniroute` / "OmniRoute").
2. **Where to keep the management key.** Choose one:
   - **(a) `ctx.dataDirectory`,** plain text. This is standard, but in LearnHarness forks with **Device Sync**, the "Plugins & their data" option would copy it to the sync endpoint.
   - **(b) A per-user folder outside LearnHarness data** (e.g. under the OS config dir). It is not synced, but outside the plugin data convention.
   - **(c) Not stored:** entered once per app session.
3. **Which sections ship first.** Suggested first release: Settings, Set-up guide (with combo creation), Routing (LearnHarness roles) with combo editing, Overview, Recent routing, and the **Explorer (4.7)**, so all OmniRoute data is reachable from the first release. The rest of 4.3 and the autopilot (4.6) follow.
4. **Whether to filter "Recent routing" to LearnHarness's own key** by default, if OmniRoute's logs support it.
5. **Which write actions to include,** from the list in 4.5 plus anything the endpoint inventory found. Default per the owner's purpose: combo create/edit/reorder/strategy and connection enable/disable; combo delete with extra confirmation; no key writes. Also ask the names of the LearnHarness combos (e.g. `OmniRoute-Strong`, `OmniRoute-Cheap`, `OmniRoute-Vision`).
6. **Autopilot defaults (4.6):** starting level (off / suggest / auto); which roles get their own combo or share a slot's combo; the fallback-tail strategy; whether `auto/*` may be the last fallback; reconcile interval and change threshold.
7. **Where it is published.** The license is already chosen: this repo's `LICENSE` is **AGPL-3.0**. Confirm the release channel (e.g. GitHub releases of this repo with a zip of `dist/`).

---

## 7. Verification before calling it done

- Typecheck against the SDK `types/`. Build, and confirm the `dist/` layout matches the plugin guide.
- **Install and test on two apps:**
  - the original **LearnHarness v0.6.1**;
  - the latest LearnHarness the owner uses (their fork).

  On both, check: discovered disabled, enable, settings, the view, the sidebar action, disable, re-enable, restart, and that an update preserves `data/`.

  Use a disposable LearnHarness profile, not the owner's real data: the app reads `LH_DATA_DIR` and related variables.
- **Test against a real local OmniRoute** (Docker or `npm i -g omniroute`, port 20128) with a test key. Check:
  - unreachable host;
  - wrong key, and inference-only key (403);
  - empty usage;
  - a fallback actually happening in a combo, visible in Recent routing;
  - each write action: confirmation shown, OmniRoute changed, view reflects it, change log entry written; a rejected write (bad input, 403) changes nothing;
  - editing a LearnHarness role's combo changes what serves the next teacher turn, with no change in LearnHarness's settings;
  - autopilot: the snapshot captures the user's models; the built combos put them first; when a fallback model goes unhealthy, the tail is re-ranked but the preferred model stays first; combos the plugin didn't create are never touched; a revert restores the previous combo.
- Test write actions only against a disposable OmniRoute instance, never the owner's real configuration.
- **Never** put keys in the repo, in `dist/`, in logs or in test fixtures.
- Write a README covering: what it does and doesn't do (section 4.4), install steps, setting up the Custom endpoint and the LearnHarness combos, what the write actions change in OmniRoute, and key-handling advice.
