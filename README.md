# OmniRoute for LearnHarness

A LearnHarness community plugin (`omniroute-lh`) that routes LearnHarness's agents through [OmniRoute](https://github.com/cheaper-inference/OmniRoute) and shows OmniRoute's data inside the app. Optionally it installs OmniRoute, starts it with LearnHarness and stops it when LearnHarness closes.

> **One manual step required**
>
> The plugin can't change LearnHarness's own settings (the plugin API doesn't allow it). After the plugin has set OmniRoute up, you do this **once** in LearnHarness:
>
> **Settings → Providers → Model API keys → + Add a provider → Custom endpoint**
> - Base URL: `http://127.0.0.1:20128/v1`. Keep the `/v1`; LearnHarness doesn't add it.
> - Mode: **API key**, using the LearnHarness key (the set-up guide has a copy button).
> - Click **Connect**, again if it was already connected. LearnHarness reads OmniRoute's model list only when you connect, so combos created later only appear after you reconnect. If they still don't show, add `OmniRoute-Strong, OmniRoute-Cheap, OmniRoute-Vision` as manual model IDs.
> - Set the **Strong / Cheap / Vision** models (and any role overrides) to `OmniRoute-Strong`, `OmniRoute-Cheap`, `OmniRoute-Vision` (…).
>
> Until you do this, routing isn't active, and the plugin shows a banner saying so. Chats that already chose their own model keep it.

Works with **LearnHarness 0.6.1 and later**, upstream or forks. It uses only plugin API v1 as it was in 0.6.1, and is type-checked against those exact types.

Your AI accounts (Claude Code, GitHub Copilot, API keys, …) must also be connected **in OmniRoute's dashboard** (Providers). The plugin can't copy LearnHarness's logins into OmniRoute.

## What it does

- **Set-up guide**: installs and starts OmniRoute (or connects to yours). On a brand-new OmniRoute it sets a dashboard password and creates the two keys it needs. It saves a copy of the models you use now and creates the `OmniRoute-*` combos with your models first. Then it walks you through the one manual step and checks that it's done.
- **Routing tab**: edit the combos LearnHarness uses (model order, models, strategy, on/off). Edit or delete any other combo, and turn provider connections on or off. Every change shows a before → after confirmation and is logged with **Revert**.
- **Overview**: OmniRoute version, health, requests, tokens and cost, usage by model and by provider, plus Explorer items you pin.
- **Recent routing**: for each request, which provider and model actually answered, fallbacks, latency, tokens, cost and cache hits. Shows LearnHarness's requests by default (toggle for all traffic). Refreshes after every teacher reply.
- **Explorer**: a read-only browser for **every** OmniRoute `GET` endpoint, listed from your OmniRoute's own API catalog. Secrets are removed before anything reaches the page.
- **Managed OmniRoute** (default): installs OmniRoute into a plugin-owned folder outside LearnHarness's data (`%LOCALAPPDATA%\omniroute-lh\runtime` on Windows). It starts OmniRoute with the app and stops it when LearnHarness closes, using a small watchdog, because Windows doesn't run plugin cleanup on exit. An OmniRoute the plugin didn't start is never stopped. The option "Keep OmniRoute running after LearnHarness closes" is for when other tools use it too.

## What it can't do

- Change or hide LearnHarness's provider, model or agent settings (hence the one manual step).
- Pick which model a chat uses. It changes what the **combo** routes to instead.
- Put routing badges inside chat messages.

## Install

1. Download `omniroute-lh-<version>.zip` from the [releases](../../releases).
2. In LearnHarness, **Settings → Community plugins** shows the plugins folder. Extract the zip **into that folder**. It contains `omniroute-lh/dist/…`, so you end up with `<plugins folder>/omniroute-lh/dist/manifest.json`.
3. Refresh the list, enable **OmniRoute for LearnHarness**, and open **OmniRoute** in the sidebar. The set-up guide starts from there.

Updating: replace only `omniroute-lh/dist/`. The `omniroute-lh/data/` folder next to it holds your settings and must be kept. Restart LearnHarness after updating.

Managed mode needs **Node.js 22.22.2+ (22.x) or 24–26** on the system. The plugin runs OmniRoute with it, not with LearnHarness's built-in runtime.

## Keys and privacy

- The plugin uses **two OmniRoute keys**: a normal key for LearnHarness's Custom endpoint, and a key with the **manage** scope for the plugin. Don't give LearnHarness the manage key.
- Keys and the OmniRoute dashboard password are stored as **plain text** in the plugin's data folder (`<plugins folder>/omniroute-lh/data/settings.json`, file mode 600). LearnHarness 0.6.1 has no secret storage.
- **Device Sync:** if your LearnHarness build has Device Sync and you sync "Plugins & their data", these secrets are copied to your sync endpoint.
- The manage key never reaches the page. The browser part only sees masked hints. The LearnHarness key is sent to the page only when you click "Copy key" in the manual step.
- OmniRoute responses are redacted on the server side, so key, token, password and cookie fields and provider credentials are removed. Request and response bodies (your prompts) are never shown.

## Development

```sh
npm install
npm run sdk          # generate LearnHarness v0.6.1 plugin types into .sdk/ (needs ../learnharness with node_modules)
npm run check        # typecheck + tests + build → dist/
npm run install:local -- "<plugins folder>"
npm run inventory    # regenerate docs/omniroute-endpoints.full.md from ../OmniRoute
```

The LearnHarness authoring skill (`learnharness-plugins/`) is only needed while developing. It is git-ignored; download it from **Settings → Community plugins → Download authoring skill**. See [BRIEF.md](BRIEF.md) for the design, [docs/decisions.md](docs/decisions.md) for product decisions and [docs/omniroute-endpoints.md](docs/omniroute-endpoints.md) for the verified OmniRoute API.

## License

AGPL-3.0-only. OmniRoute itself is MIT-licensed and is installed separately, not bundled.
