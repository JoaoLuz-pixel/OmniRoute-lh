| Method | Path | Auth guard | Stream | Summary (openapi.yaml) |
|---|---|---|---|---|
| GET | `/api/{...omnirouteApiCatchAll}` | none-detected |  |  |
| POST | `/api/{...omnirouteApiCatchAll}` | none-detected |  |  |
| PUT | `/api/{...omnirouteApiCatchAll}` | none-detected |  |  |
| PATCH | `/api/{...omnirouteApiCatchAll}` | none-detected |  |  |
| DELETE | `/api/{...omnirouteApiCatchAll}` | none-detected |  |  |
| GET | `/api/a2a/status` | none-detected |  | GET a2a › status |
| POST | `/api/a2a/tasks/{id}/cancel` | none-detected |  | POST a2a › tasks › <id> › cancel |
| GET | `/api/a2a/tasks/{id}` | none-detected |  | GET a2a › tasks › <id> |
| GET | `/api/a2a/tasks/history` | none-detected |  |  |
| GET | `/api/a2a/tasks` | none-detected |  | GET a2a › tasks |
| POST | `/api/a2a/tasks` | none-detected |  | POST a2a › tasks |
| GET | `/api/acp/agents` | isAuthenticated |  | GET acp › agents |
| POST | `/api/acp/agents` | isAuthenticated |  | POST acp › agents |
| DELETE | `/api/acp/agents` | isAuthenticated |  | DELETE acp › agents |
| GET | `/api/admin/concurrency` | requireManagementAuth |  | GET admin › concurrency |
| POST | `/api/admin/concurrency` | requireManagementAuth |  | POST admin › concurrency |
| GET | `/api/admin/proxy-pool-visibility` | requireManagementAuth |  |  |
| GET | `/api/agent-skills/{id}/raw` | none-detected |  | Get raw SKILL.md content |
| GET | `/api/agent-skills/{id}` | none-detected |  | Get a single agent skill |
| GET | `/api/agent-skills/coverage` | none-detected |  | Get SKILL.md coverage stats |
| POST | `/api/agent-skills/generate` | requireManagementAuth |  | Trigger SKILL.md generator |
| GET | `/api/agent-skills` | none-detected |  | List agent skills catalog |
| GET | `/api/analytics/auto-routing` | requireManagementAuth |  | GET analytics › auto routing |
| GET | `/api/analytics/compression` | requireManagementAuth |  | GET analytics › compression |
| GET | `/api/analytics/diversity` | none-detected |  | GET analytics › diversity |
| GET | `/api/assess` | none-detected |  | GET assess |
| POST | `/api/assess` | none-detected |  | POST assess |
| GET | `/api/auth/csrf` | requireManagementAuth |  | GET auth › csrf |
| POST | `/api/auth/login` | none-detected |  | Authenticate user |
| POST | `/api/auth/logout` | none-detected |  | Log out |
| POST | `/api/auth/mfa/disable` | requireManagementAuth |  | Turn two-factor authentication off |
| POST | `/api/auth/mfa/enable` | requireManagementAuth |  | Finish two-factor enrollment |
| POST | `/api/auth/mfa/setup` | requireManagementAuth |  | Start two-factor enrollment |
| GET | `/api/auth/mfa/status` | requireManagementAuth |  | Two-factor authentication status |
| POST | `/api/auth/mfa/verify` | none-detected |  | Complete a two-factor sign-in |
| GET | `/api/auth/oidc/callback` | none-detected |  | Complete OIDC login for the dashboard admin gate |
| GET | `/api/auth/oidc/login` | none-detected |  | Start OIDC login for the dashboard admin gate |
| GET | `/api/auth/sso/config` | none-detected |  |  |
| GET | `/api/auth/status` | none-detected |  | GET auth › status |
| GET | `/api/batches/{id}` | none-detected |  | GET batches › <id> |
| GET | `/api/batches` | none-detected |  | GET batches |
| GET | `/api/cache/entries` | isAuthenticated |  | GET cache › entries |
| DELETE | `/api/cache/entries` | isAuthenticated |  | DELETE cache › entries |
| GET | `/api/cache/reasoning` | isAuthenticated |  | GET cache › reasoning |
| DELETE | `/api/cache/reasoning` | isAuthenticated |  | DELETE cache › reasoning |
| GET | `/api/cache` | isAuthenticated |  | Get cache statistics |
| DELETE | `/api/cache` | isAuthenticated |  | Clear all caches |
| GET | `/api/cache/stats` | isAuthenticated |  | Get detailed cache statistics |
| DELETE | `/api/cache/stats` | isAuthenticated |  | Clear cache statistics |
| GET | `/api/chaos/config` | requireManagementAuth |  | GET chaos › config |
| PUT | `/api/chaos/config` | requireManagementAuth |  | PUT chaos › config |
| DELETE | `/api/chaos/config` | requireManagementAuth |  | DELETE chaos › config |
| POST | `/api/chaos/run` | requireManagementAuth |  | POST chaos › run |
| GET | `/api/cli-tools/all-statuses` | requireCliToolsAuth |  | GET cli tools › all statuses |
| GET | `/api/cli-tools/antigravity-mitm/alias` | requireCliToolsAuth |  | Get Antigravity MITM alias configuration |
| PUT | `/api/cli-tools/antigravity-mitm/alias` | requireCliToolsAuth |  | Update Antigravity MITM alias configuration |
| GET | `/api/cli-tools/antigravity-mitm` | requireCliToolsAuth |  | Get Antigravity MITM proxy settings |
| POST | `/api/cli-tools/antigravity-mitm` | requireCliToolsAuth |  | Update Antigravity MITM proxy settings |
| DELETE | `/api/cli-tools/antigravity-mitm` | requireCliToolsAuth |  | Reset Antigravity MITM proxy settings |
| POST | `/api/cli-tools/apply` | requireCliToolsAuth |  | POST cli tools › apply |
| GET | `/api/cli-tools/backups` | requireCliToolsAuth |  | List CLI tool backups |
| POST | `/api/cli-tools/backups` | requireCliToolsAuth |  | Create CLI tool backup |
| DELETE | `/api/cli-tools/backups` | requireCliToolsAuth |  |  |
| GET | `/api/cli-tools/claude-settings` | requireCliToolsAuth |  | Get Claude CLI settings |
| POST | `/api/cli-tools/claude-settings` | requireCliToolsAuth |  | Apply Claude CLI settings |
| DELETE | `/api/cli-tools/claude-settings` | requireCliToolsAuth |  | Reset Claude CLI settings |
| GET | `/api/cli-tools/cline-settings` | requireCliToolsAuth |  | Get Cline CLI settings |
| POST | `/api/cli-tools/cline-settings` | requireCliToolsAuth |  | Apply Cline CLI settings |
| DELETE | `/api/cli-tools/cline-settings` | requireCliToolsAuth |  | Reset Cline CLI settings |
| GET | `/api/cli-tools/codewhale-settings` | requireCliToolsAuth |  | Read CodeWhale CLI OmniRoute config |
| POST | `/api/cli-tools/codewhale-settings` | requireCliToolsAuth |  | Write CodeWhale CLI OmniRoute config |
| DELETE | `/api/cli-tools/codewhale-settings` | requireCliToolsAuth |  | Remove OmniRoute from CodeWhale CLI config |
| GET | `/api/cli-tools/codex-profiles` | requireCliToolsAuth |  | Get Codex profiles |
| POST | `/api/cli-tools/codex-profiles` | requireCliToolsAuth |  | Create Codex profile |
| PUT | `/api/cli-tools/codex-profiles` | requireCliToolsAuth |  | Update Codex profile |
| DELETE | `/api/cli-tools/codex-profiles` | requireCliToolsAuth |  | Delete Codex profile |
| GET | `/api/cli-tools/codex-settings` | requireCliToolsAuth |  | Get Codex CLI settings |
| POST | `/api/cli-tools/codex-settings` | requireCliToolsAuth |  | Apply Codex CLI settings |
| DELETE | `/api/cli-tools/codex-settings` | requireCliToolsAuth |  | Reset Codex CLI settings |
| GET | `/api/cli-tools/config` | requireCliToolsAuth |  | GET cli tools › config |
| POST | `/api/cli-tools/config` | requireCliToolsAuth |  | POST cli tools › config |
| GET | `/api/cli-tools/crush-settings` | requireCliToolsAuth |  | Read Crush CLI OmniRoute config |
| POST | `/api/cli-tools/crush-settings` | requireCliToolsAuth |  | Write Crush CLI OmniRoute config |
| DELETE | `/api/cli-tools/crush-settings` | requireCliToolsAuth |  | Remove OmniRoute from Crush CLI config |
| GET | `/api/cli-tools/deepseek-tui-settings` | requireCliToolsAuth |  | GET cli tools › deepseek tui settings |
| POST | `/api/cli-tools/deepseek-tui-settings` | requireCliToolsAuth |  | POST cli tools › deepseek tui settings |
| DELETE | `/api/cli-tools/deepseek-tui-settings` | requireCliToolsAuth |  | DELETE cli tools › deepseek tui settings |
| GET | `/api/cli-tools/detect` | requireCliToolsAuth |  | GET cli tools › detect |
| GET | `/api/cli-tools/droid-settings` | requireCliToolsAuth |  | Get Droid CLI settings |
| POST | `/api/cli-tools/droid-settings` | requireCliToolsAuth |  | Apply Droid CLI settings |
| DELETE | `/api/cli-tools/droid-settings` | requireCliToolsAuth |  | Reset Droid CLI settings |
| GET | `/api/cli-tools/forge-settings` | requireCliToolsAuth |  | GET cli tools › forge settings |
| POST | `/api/cli-tools/forge-settings` | requireCliToolsAuth |  | POST cli tools › forge settings |
| DELETE | `/api/cli-tools/forge-settings` | requireCliToolsAuth |  | DELETE cli tools › forge settings |
| GET | `/api/cli-tools/grok-build-settings` | requireCliToolsAuth |  | GET cli tools › grok build settings |
| POST | `/api/cli-tools/grok-build-settings` | requireCliToolsAuth |  | POST cli tools › grok build settings |
| DELETE | `/api/cli-tools/grok-build-settings` | requireCliToolsAuth |  | DELETE cli tools › grok build settings |
| GET | `/api/cli-tools/guide-settings/{toolId}` | requireCliToolsAuth |  | Get guide settings for a tool |
| POST | `/api/cli-tools/guide-settings/{toolId}` | requireCliToolsAuth |  |  |
| GET | `/api/cli-tools/hermes-agent-settings` | requireCliToolsAuth |  | GET cli tools › hermes agent settings |
| POST | `/api/cli-tools/hermes-agent-settings` | requireCliToolsAuth |  | POST cli tools › hermes agent settings |
| GET | `/api/cli-tools/jcode-settings` | requireCliToolsAuth |  | GET cli tools › jcode settings |
| POST | `/api/cli-tools/jcode-settings` | requireCliToolsAuth |  | POST cli tools › jcode settings |
| DELETE | `/api/cli-tools/jcode-settings` | requireCliToolsAuth |  | DELETE cli tools › jcode settings |
| GET | `/api/cli-tools/keys` | requireCliToolsAuth |  | GET cli tools › keys |
| GET | `/api/cli-tools/kilo-settings` | requireCliToolsAuth |  | Get Kilo CLI settings |
| POST | `/api/cli-tools/kilo-settings` | requireCliToolsAuth |  | Apply Kilo CLI settings |
| DELETE | `/api/cli-tools/kilo-settings` | requireCliToolsAuth |  | Reset Kilo CLI settings |
| GET | `/api/cli-tools/letta-settings` | requireCliToolsAuth |  | GET cli tools › letta settings |
| POST | `/api/cli-tools/letta-settings` | requireCliToolsAuth |  | POST cli tools › letta settings |
| DELETE | `/api/cli-tools/letta-settings` | requireCliToolsAuth |  | DELETE cli tools › letta settings |
| GET | `/api/cli-tools/logs` | requireCliToolsAuth | yes | GET cli tools › logs |
| GET | `/api/cli-tools/omp-settings` | requireCliToolsAuth |  | GET cli tools › omp settings |
| POST | `/api/cli-tools/omp-settings` | requireCliToolsAuth |  | POST cli tools › omp settings |
| DELETE | `/api/cli-tools/omp-settings` | requireCliToolsAuth |  | DELETE cli tools › omp settings |
| GET | `/api/cli-tools/openclaw-settings` | requireCliToolsAuth |  | Get OpenClaw CLI settings |
| POST | `/api/cli-tools/openclaw-settings` | requireCliToolsAuth |  | Apply OpenClaw CLI settings |
| DELETE | `/api/cli-tools/openclaw-settings` | requireCliToolsAuth |  | Reset OpenClaw CLI settings |
| GET | `/api/cli-tools/openclaw/auto-order` | requireCliToolsAuth |  | GET cli tools › openclaw › auto order |
| GET | `/api/cli-tools/pi-settings` | requireCliToolsAuth |  | GET cli tools › pi settings |
| POST | `/api/cli-tools/pi-settings` | requireCliToolsAuth |  | POST cli tools › pi settings |
| DELETE | `/api/cli-tools/pi-settings` | requireCliToolsAuth |  | DELETE cli tools › pi settings |
| GET | `/api/cli-tools/qwen-settings` | requireCliToolsAuth |  | GET cli tools › qwen settings |
| POST | `/api/cli-tools/qwen-settings` | requireCliToolsAuth |  | POST cli tools › qwen settings |
| DELETE | `/api/cli-tools/qwen-settings` | requireCliToolsAuth |  | DELETE cli tools › qwen settings |
| GET | `/api/cli-tools/runtime/{toolId}` | requireCliToolsAuth |  | Get runtime status for a CLI tool |
| GET | `/api/cli-tools/smelt-settings` | requireCliToolsAuth |  | GET cli tools › smelt settings |
| POST | `/api/cli-tools/smelt-settings` | requireCliToolsAuth |  | POST cli tools › smelt settings |
| DELETE | `/api/cli-tools/smelt-settings` | requireCliToolsAuth |  | DELETE cli tools › smelt settings |
| GET | `/api/cli-tools/status` | requireCliToolsAuth |  | GET cli tools › status |
| GET | `/api/cli-tools/whycodes-settings` | requireCliToolsAuth |  |  |
| POST | `/api/cli-tools/whycodes-settings` | requireCliToolsAuth |  |  |
| POST | `/api/cli/connect` | none-detected |  | Exchange the management password for a scoped CLI access token |
| DELETE | `/api/cli/tokens/{id}` | requireManagementAuth |  | Revoke an access token by id or display prefix — admin scope |
| GET | `/api/cli/tokens` | requireManagementAuth |  | List access tokens (masked) — admin scope |
| POST | `/api/cli/tokens` | requireManagementAuth |  | Create a scoped access token — admin scope |
| GET | `/api/cli/whoami` | requireManagementAuth |  | Report the current credential (scope, name, expiry) |
| POST | `/api/cloud/auth` | none-detected |  | Authenticate with cloud worker |
| PUT | `/api/cloud/credentials/update` | requireManagementAuth |  | Update cloud worker credentials |
| POST | `/api/cloud/model/resolve` | none-detected |  | Resolve model via cloud |
| GET | `/api/cloud/models/alias` | requireManagementAuth |  | Get cloud model aliases |
| PUT | `/api/cloud/models/alias` | requireManagementAuth |  | Update cloud model alias |
| GET | `/api/codex/connect/{token}` | none-detected |  | GET codex › connect › <token> |
| POST | `/api/codex/connect/{token}` | none-detected |  | POST codex › connect › <token> |
| GET | `/api/combos/{id}` | requireManagementAuth |  | Get combo by ID |
| PUT | `/api/combos/{id}` | requireManagementAuth |  | Update combo |
| PATCH | `/api/combos/{id}` | requireManagementAuth |  | Update combo |
| DELETE | `/api/combos/{id}` | requireManagementAuth |  | Delete combo |
| GET | `/api/combos/auto` | requireManagementAuth |  | GET combos › auto |
| GET | `/api/combos/builder/options` | requireManagementAuth |  | GET combos › builder › options |
| POST | `/api/combos/duplicate` | requireManagementAuth |  | POST combos › duplicate |
| GET | `/api/combos/export` | requireManagementAuth |  |  |
| POST | `/api/combos/import` | requireManagementAuth |  |  |
| GET | `/api/combos/metrics` | requireManagementAuth |  | Get combo metrics |
| DELETE | `/api/combos/metrics` | requireManagementAuth |  |  |
| POST | `/api/combos/reorder` | requireManagementAuth |  | POST combos › reorder |
| GET | `/api/combos` | requireManagementAuth |  | List routing combos |
| POST | `/api/combos` | requireManagementAuth |  | Create routing combo |
| POST | `/api/combos/test` | requireManagementAuth |  | Test a combo configuration |
| GET | `/api/compliance/audit-log` | requireManagementAuth |  | Get compliance audit log |
| POST | `/api/compression/compare` | requireManagementAuth |  | POST compression › compare |
| POST | `/api/compression/compare/verify` | requireManagementAuth |  | POST compression › compare › verify |
| GET | `/api/compression/engines` | requireManagementAuth |  | GET compression › engines |
| GET | `/api/compression/language-packs` | requireManagementAuth |  | List Caveman compression language packs |
| POST | `/api/compression/preview` | requireManagementAuth |  | Preview compression for a message payload |
| POST | `/api/compression/retrieve` | requireManagementAuth |  | POST compression › retrieve |
| GET | `/api/compression/rules` | requireManagementAuth |  | List Caveman compression rule metadata |
| POST | `/api/conductor/ask` | requireManagementAuth |  | POST conductor › ask |
| GET | `/api/conductor/fleet` | requireManagementAuth |  | GET conductor › fleet |
| POST | `/api/conductor/tasks/{id}/cancel` | requireManagementAuth |  | POST conductor › tasks › <id> › cancel |
| GET | `/api/conductor/tasks/{id}` | requireManagementAuth |  | GET conductor › tasks › <id> |
| POST | `/api/conductor/tasks` | requireManagementAuth |  | POST conductor › tasks |
| GET | `/api/context/analytics/engine` | requireManagementAuth |  | GET context › analytics › engine |
| GET | `/api/context/analytics` | none-detected |  | GET context › analytics |
| GET | `/api/context/caveman/config` | none-detected |  | GET context › caveman › config |
| PUT | `/api/context/caveman/config` | none-detected |  | PUT context › caveman › config |
| GET | `/api/context/combos/{id}/assignments` | requireManagementAuth |  | GET context › combos › <id> › assignments |
| PUT | `/api/context/combos/{id}/assignments` | requireManagementAuth |  | PUT context › combos › <id> › assignments |
| GET | `/api/context/combos/{id}` | requireManagementAuth |  | GET context › combos › <id> |
| PUT | `/api/context/combos/{id}` | requireManagementAuth |  | PUT context › combos › <id> |
| DELETE | `/api/context/combos/{id}` | requireManagementAuth |  | DELETE context › combos › <id> |
| GET | `/api/context/combos/default` | requireManagementAuth |  | GET context › combos › default |
| POST | `/api/context/combos/default` | requireManagementAuth |  | POST context › combos › default |
| PUT | `/api/context/combos/default` | requireManagementAuth |  | PUT context › combos › default |
| GET | `/api/context/combos` | requireManagementAuth |  | GET context › combos |
| POST | `/api/context/combos` | requireManagementAuth |  | POST context › combos |
| GET | `/api/context/rtk/config` | requireManagementAuth |  | Get RTK compression settings |
| PUT | `/api/context/rtk/config` | requireManagementAuth |  | Update RTK compression settings |
| GET | `/api/context/rtk/discover` | requireManagementAuth |  | GET context › rtk › discover |
| GET | `/api/context/rtk/filters` | requireManagementAuth |  | List RTK filters and load diagnostics |
| POST | `/api/context/rtk/import` | requireManagementAuth |  | Validate or install an RTK TOML schema v1 filter file |
| GET | `/api/context/rtk/learn` | requireManagementAuth |  | GET context › rtk › learn |
| GET | `/api/context/rtk/raw-output/{id}` | requireManagementAuth |  | Read retained redacted RTK raw output |
| POST | `/api/context/rtk/test` | requireManagementAuth |  | Run RTK compression preview for text |
| GET | `/api/conversations/{id}` | requireManagementAuth |  |  |
| GET | `/api/conversations/{id}/tree` | requireManagementAuth |  | GET conversations › <id> › tree |
| GET | `/api/conversations` | requireManagementAuth |  | GET conversations |
| POST | `/api/copilot/chat` | requireManagementAuth |  | POST copilot › chat |
| GET | `/api/cursor-cli/{...path}` | none-detected |  |  |
| POST | `/api/cursor-cli/{...path}` | none-detected |  |  |
| POST | `/api/dahl/tokens` | none-detected |  | POST dahl › tokens |
| GET | `/api/db-backups/export` | none-detected | yes | GET db backups › export |
| GET | `/api/db-backups/exportAll` | none-detected | yes | GET db backups › exportAll |
| POST | `/api/db-backups/import` | none-detected |  | POST db backups › import |
| GET | `/api/db-backups` | isAuthenticated |  | List database backups |
| POST | `/api/db-backups` | isAuthenticated |  | Restore a database backup by id |
| PUT | `/api/db-backups` | isAuthenticated |  |  |
| PATCH | `/api/db-backups` | isAuthenticated |  | Save database backup retention settings |
| DELETE | `/api/db-backups` | isAuthenticated |  |  |
| GET | `/api/db/health` | isAuthenticated |  | GET db › health |
| POST | `/api/db/health` | isAuthenticated |  | POST db › health |
| GET | `/api/discovery/results/{id}` | requireManagementAuth |  | GET discovery › results › <id> |
| DELETE | `/api/discovery/results/{id}` | requireManagementAuth |  | DELETE discovery › results › <id> |
| GET | `/api/discovery/results` | requireManagementAuth |  | GET discovery › results |
| POST | `/api/discovery/scan` | requireManagementAuth |  | POST discovery › scan |
| POST | `/api/discovery/verify/{id}` | requireManagementAuth |  | POST discovery › verify › <id> |
| GET | `/api/docs/codex-cli` | none-detected |  | GET docs › codex cli |
| GET | `/api/docs` | none-detected |  | GET docs |
| GET | `/api/evals/{suiteId}` | requireManagementAuth |  | Get eval suite details |
| GET | `/api/evals` | requireManagementAuth |  | List eval suites |
| POST | `/api/evals` | requireManagementAuth |  | Run evaluation |
| GET | `/api/evals/suites/{suiteId}` | requireManagementAuth |  | GET evals › suites › <suiteId> |
| PUT | `/api/evals/suites/{suiteId}` | requireManagementAuth |  | PUT evals › suites › <suiteId> |
| DELETE | `/api/evals/suites/{suiteId}` | requireManagementAuth |  | DELETE evals › suites › <suiteId> |
| POST | `/api/evals/suites` | requireManagementAuth |  | POST evals › suites |
| GET | `/api/fallback/chains` | none-detected |  | List fallback chains |
| POST | `/api/fallback/chains` | none-detected |  | Create fallback chain |
| DELETE | `/api/fallback/chains` | none-detected |  | Delete fallback chain |
| GET | `/api/files/{id}/content` | none-detected |  | GET files › <id> › content |
| GET | `/api/files` | none-detected |  | GET files |
| GET | `/api/free-models` | requireManagementAuth |  | GET free models |
| GET | `/api/free-provider-rankings` | none-detected |  | GET free provider rankings |
| GET | `/api/free-tier/summary` | isAuthenticated |  | GET free tier › summary |
| GET | `/api/gamification/anomalies` | requireManagementAuth |  | GET gamification › anomalies |
| GET | `/api/gamification/badges/earned` | requireManagementAuth |  | GET gamification › badges › earned |
| GET | `/api/gamification/badges` | requireManagementAuth |  | GET gamification › badges |
| GET | `/api/gamification/federation/leaderboard` | none-detected |  | GET gamification › federation › leaderboard |
| POST | `/api/gamification/federation/score` | none-detected |  | POST gamification › federation › score |
| POST | `/api/gamification/invite/redeem` | requireManagementAuth |  | POST gamification › invite › redeem |
| GET | `/api/gamification/invite` | requireManagementAuth |  | GET gamification › invite |
| POST | `/api/gamification/invite` | requireManagementAuth |  | POST gamification › invite |
| DELETE | `/api/gamification/invite` | requireManagementAuth |  | DELETE gamification › invite |
| GET | `/api/gamification/leaderboard` | requireManagementAuth |  | GET gamification › leaderboard |
| GET | `/api/gamification/level` | requireManagementAuth |  | GET gamification › level |
| GET | `/api/gamification/notifications` | requireManagementAuth | yes | GET gamification › notifications |
| POST | `/api/gamification/rotate` | requireManagementAuth |  | POST gamification › rotate |
| GET | `/api/gamification/servers` | requireManagementAuth |  | GET gamification › servers |
| POST | `/api/gamification/servers` | requireManagementAuth |  | POST gamification › servers |
| DELETE | `/api/gamification/servers` | requireManagementAuth |  | DELETE gamification › servers |
| GET | `/api/gamification/stream` | requireManagementAuth | yes | GET gamification › stream |
| GET | `/api/gamification/transfer` | requireManagementAuth |  | GET gamification › transfer |
| POST | `/api/gamification/transfer` | requireManagementAuth |  | POST gamification › transfer |
| GET | `/api/github-skills` | requireManagementAuth |  | GET github skills |
| POST | `/api/github-skills` | requireManagementAuth |  | POST github skills |
| GET | `/api/guardrails` | requireManagementAuth |  | GET guardrails |
| POST | `/api/guardrails/test` | requireManagementAuth |  | POST guardrails › test |
| POST | `/api/headroom/start` | none-detected |  | POST headroom › start |
| GET | `/api/headroom/status` | none-detected |  | GET headroom › status |
| POST | `/api/headroom/stop` | none-detected |  | POST headroom › stop |
| GET | `/api/health/degradation` | none-detected |  | GET health › degradation |
| GET | `/api/health/ping` | none-detected |  | GET health › ping |
| GET | `/api/health` | none-detected |  | Liveness probe |
| GET | `/api/init` | requireManagementAuth |  | Initialize application |
| POST | `/api/intelligence/overrides` | requireManagementAuth |  | POST intelligence › overrides |
| DELETE | `/api/intelligence/overrides` | requireManagementAuth |  | DELETE intelligence › overrides |
| GET | `/api/intelligence/sync` | requireManagementAuth |  | GET intelligence › sync |
| POST | `/api/intelligence/sync` | requireManagementAuth |  | POST intelligence › sync |
| DELETE | `/api/intelligence/sync` | requireManagementAuth |  | DELETE intelligence › sync |
| POST | `/api/internal/codex-responses-ws` | authenticate |  | POST internal › codex responses ws |
| GET | `/api/issue-agent/runs` | none-detected |  | GET issue agent › runs |
| POST | `/api/issue-agent/runs` | none-detected |  | POST issue agent › runs |
| POST | `/api/jobs/{id}/disable` | none-detected |  | Disable a background job |
| POST | `/api/jobs/{id}/enable` | none-detected |  | Enable a background job |
| POST | `/api/jobs/{id}/run-now` | none-detected |  | Trigger a background job |
| GET | `/api/jobs/{id}/runs` | none-detected |  | Read background-job run history |
| GET | `/api/jobs` | none-detected |  | List registered background jobs |
| GET | `/api/key-templates/{id}` | requireManagementAuth |  | Read a template and its reference issues |
| PATCH | `/api/key-templates/{id}` | requireManagementAuth |  | Edit a template with an optimistic revision check |
| DELETE | `/api/key-templates/{id}` | requireManagementAuth |  | Delete a template without changing existing keys |
| GET | `/api/key-templates` | requireManagementAuth |  | List reusable key policy templates |
| POST | `/api/key-templates` | requireManagementAuth |  | Save a policy or an existing key as a template |
| POST | `/api/keys/{id}/access` | requireManagementAuth |  | Add or remove allowed models and combos on an API key atomically |
| GET | `/api/keys/{id}/devices` | requireManagementAuth |  | List devices for an API key |
| POST | `/api/keys/{id}/regenerate` | requireManagementAuth |  | POST keys › <id> › regenerate |
| GET | `/api/keys/{id}/reveal` | requireManagementAuth |  | GET keys › <id> › reveal |
| GET | `/api/keys/{id}` | requireManagementAuth |  | Get API key |
| PATCH | `/api/keys/{id}` | requireManagementAuth |  | Update API key |
| DELETE | `/api/keys/{id}` | requireManagementAuth |  | Delete API key |
| GET | `/api/keys/{id}/self-service` | requireManagementAuth |  | GET keys › <id> › self service |
| PUT | `/api/keys/{id}/self-service` | requireManagementAuth |  | PUT keys › <id> › self service |
| GET | `/api/keys/{id}/template-policy` | requireManagementAuth |  | Preview a key policy without revealing its credential |
| GET | `/api/keys/{id}/usage-limits` | requireManagementAuth |  | GET keys › <id> › usage limits |
| GET | `/api/keys/groups/{id}/keys` | none-detected |  | GET keys › groups › <id> › keys |
| POST | `/api/keys/groups/{id}/keys` | none-detected |  | POST keys › groups › <id> › keys |
| DELETE | `/api/keys/groups/{id}/keys` | none-detected |  | DELETE keys › groups › <id> › keys |
| GET | `/api/keys/groups/{id}/permissions` | none-detected |  | GET keys › groups › <id> › permissions |
| POST | `/api/keys/groups/{id}/permissions` | none-detected |  | POST keys › groups › <id> › permissions |
| DELETE | `/api/keys/groups/{id}/permissions` | none-detected |  | DELETE keys › groups › <id> › permissions |
| GET | `/api/keys/groups/{id}` | none-detected |  | GET keys › groups › <id> |
| PUT | `/api/keys/groups/{id}` | none-detected |  | PUT keys › groups › <id> |
| DELETE | `/api/keys/groups/{id}` | none-detected |  | DELETE keys › groups › <id> |
| GET | `/api/keys/groups` | none-detected |  | GET keys › groups |
| POST | `/api/keys/groups` | none-detected |  | POST keys › groups |
| POST | `/api/keys/import` | requireManagementAuth |  | Import a caller-supplied API key without replacing existing keys |
| GET | `/api/keys` | requireManagementAuth |  | List API keys |
| POST | `/api/keys` | requireManagementAuth |  | Create API key |
| POST | `/api/local/redis/start` | none-detected |  | POST local › redis › start |
| GET | `/api/local/redis/status` | none-detected |  | GET local › redis › status |
| POST | `/api/local/redis/stop` | none-detected |  | POST local › redis › stop |
| GET | `/api/log-export/destinations/{id}` | requireManagementAuth |  | Read one log-export destination |
| PUT | `/api/log-export/destinations/{id}` | requireManagementAuth |  | Update a log-export destination |
| DELETE | `/api/log-export/destinations/{id}` | requireManagementAuth |  | Delete a log-export destination |
| POST | `/api/log-export/destinations/{id}/run` | requireManagementAuth |  | Run a log-export destination now |
| POST | `/api/log-export/destinations/{id}/test` | requireManagementAuth |  | Test a log-export destination |
| GET | `/api/log-export/destinations` | requireManagementAuth |  | List log-export destinations |
| POST | `/api/log-export/destinations` | requireManagementAuth |  | Create a log-export destination |
| GET | `/api/log-export/status` | requireManagementAuth |  | Log-export scheduler status |
| GET | `/api/log-export/types` | requireManagementAuth |  | List log-export destination types |
| GET | `/api/logs/{id}` | requireManagementAuth |  | GET logs › <id> |
| GET | `/api/logs/console` | requireManagementAuth |  | Read retained application console history |
| GET | `/api/logs/detail` | requireManagementAuth |  | GET logs › detail |
| POST | `/api/logs/detail` | requireManagementAuth |  | POST logs › detail |
| GET | `/api/logs/export` | requireManagementAuth | yes | GET logs › export |
| GET | `/api/mcp/audit` | requireManagementAuth |  | GET mcp › audit |
| GET | `/api/mcp/audit/stats` | requireManagementAuth |  | GET mcp › audit › stats |
| POST | `/api/mcp/restart` | requireManagementAuth |  |  |
| GET | `/api/mcp/sse` | requireManagementAuth |  | GET mcp › sse |
| POST | `/api/mcp/sse` | requireManagementAuth |  | POST mcp › sse |
| GET | `/api/mcp/status` | requireManagementAuth |  | GET mcp › status |
| GET | `/api/mcp/stream` | requireManagementAuth |  | GET mcp › stream |
| POST | `/api/mcp/stream` | requireManagementAuth |  | POST mcp › stream |
| DELETE | `/api/mcp/stream` | requireManagementAuth |  | DELETE mcp › stream |
| GET | `/api/mcp/tools` | requireManagementAuth |  | GET mcp › tools |
| GET | `/api/memory/{id}` | requireManagementAuth |  | Get a single memory entry |
| PUT | `/api/memory/{id}` | requireManagementAuth |  | Update a memory entry |
| DELETE | `/api/memory/{id}` | requireManagementAuth |  | Delete a memory entry |
| GET | `/api/memory/embedding-providers` | isAuthenticated |  | List embedding providers |
| GET | `/api/memory/engine-status` | isAuthenticated |  | Memory engine status |
| GET | `/api/memory/health` | requireManagementAuth |  | Memory store health check |
| POST | `/api/memory/reindex` | requireManagementAuth |  | Trigger vector reindex |
| GET | `/api/memory/rerank-providers` | isAuthenticated |  |  |
| POST | `/api/memory/retrieve-preview` | requireManagementAuth |  | Dry-run memory retrieval (Playground) |
| GET | `/api/memory` | requireManagementAuth |  | List memory entries |
| POST | `/api/memory` | requireManagementAuth |  | Create a memory entry |
| POST | `/api/memory/summarize` | requireManagementAuth |  | Compact old memories |
| GET | `/api/middleware/hooks/{name}` | requireManagementAuth |  | GET middleware › hooks › <name> |
| PUT | `/api/middleware/hooks/{name}` | requireManagementAuth |  | PUT middleware › hooks › <name> |
| DELETE | `/api/middleware/hooks/{name}` | requireManagementAuth |  | DELETE middleware › hooks › <name> |
| GET | `/api/middleware/hooks` | requireManagementAuth |  | GET middleware › hooks |
| POST | `/api/middleware/hooks` | requireManagementAuth |  | POST middleware › hooks |
| GET | `/api/modality-bridge/stats` | requireManagementAuth |  | Get Modality Bridge telemetry |
| GET | `/api/modality-bridge/video/drilldown` | none-detected |  | Read a bounded Video Bridge drill-down slice |
| POST | `/api/modality-bridge/video/drilldown` | none-detected |  | Store a bounded Video Bridge drill-down result |
| DELETE | `/api/modality-bridge/video/drilldown` | none-detected |  | Delete a Video Bridge drill-down session |
| POST | `/api/modality-bridge/video/extract` | none-detected |  | Extract bounded Video Bridge frames through the internal broker |
| GET | `/api/modality-bridge/video/runtime` | requireManagementAuth |  | Get Video Bridge runtime status |
| GET | `/api/model-capability-overrides` | requireManagementAuth |  | GET model capability overrides |
| PATCH | `/api/model-capability-overrides` | requireManagementAuth |  | PATCH model capability overrides |
| DELETE | `/api/model-capability-overrides` | requireManagementAuth |  | DELETE model capability overrides |
| GET | `/api/model-combo-mappings/{id}` | requireManagementAuth |  | GET model combo mappings › <id> |
| PUT | `/api/model-combo-mappings/{id}` | requireManagementAuth |  | PUT model combo mappings › <id> |
| DELETE | `/api/model-combo-mappings/{id}` | requireManagementAuth |  | DELETE model combo mappings › <id> |
| GET | `/api/model-combo-mappings` | requireManagementAuth |  | GET model combo mappings |
| POST | `/api/model-combo-mappings` | requireManagementAuth |  | POST model combo mappings |
| GET | `/api/models/alias` | requireManagementAuth |  |  |
| PUT | `/api/models/alias` | requireManagementAuth |  | Create or update a model alias |
| DELETE | `/api/models/alias` | requireManagementAuth |  |  |
| GET | `/api/models/catalog` | requireManagementAuth |  | Get full model catalog |
| POST | `/api/models/new/acknowledge` | requireManagementAuth |  |  |
| GET | `/api/models/new` | requireManagementAuth |  |  |
| GET | `/api/models/openrouter-catalog` | isAuthenticated |  | GET models › openrouter catalog |
| GET | `/api/models` | none-detected |  | List models (management) |
| PUT | `/api/models` | none-detected |  |  |
| POST | `/api/models/test-all` | requireManagementAuth |  | POST models › test all |
| POST | `/api/models/test` | requireManagementAuth |  | POST models › test |
| GET | `/api/monitoring/compression` | none-detected |  | Get compression result-memo statistics |
| GET | `/api/monitoring/health` | requireManagementAuth+isAuthenticated |  | System health check |
| DELETE | `/api/monitoring/health` | requireManagementAuth+isAuthenticated |  |  |
| GET | `/api/monitoring/model-health` | requireManagementAuth |  | Get per-model health states |
| GET | `/api/network/info` | isAuthenticated |  | GET network › info |
| GET | `/api/oauth/{provider}/{action}` | requireManagementAuth+requireOAuthRouteAuth+isAuthenticated |  | OAuth flow handler |
| POST | `/api/oauth/{provider}/{action}` | requireManagementAuth+requireOAuthRouteAuth+isAuthenticated |  |  |
| POST | `/api/oauth/{provider}/import-export` | requireManagementAuth |  | Import OAuth accounts from a third-party account-manager export |
| POST | `/api/oauth/{provider}/paste-credentials` | requireManagementAuth |  | POST oauth › <provider> › paste credentials |
| POST | `/api/oauth/chatgpt/session` | requireManagementAuth |  |  |
| GET | `/api/oauth/cliproxy-import` | requireManagementAuth+requireImportAuth |  | GET oauth › cliproxy import |
| POST | `/api/oauth/cliproxy-import` | requireManagementAuth+requireImportAuth |  | POST oauth › cliproxy import |
| POST | `/api/oauth/codex/import-token` | requireManagementAuth+requireAuth |  | Import a Codex connection from a bare access token |
| POST | `/api/oauth/codex/import` | requireManagementAuth+requireAuth |  | POST oauth › codex › import |
| GET | `/api/oauth/cursor/auto-import` | requireManagementAuth |  | Auto-import Cursor OAuth credentials |
| GET | `/api/oauth/cursor/import` | requireManagementAuth+requireOAuthImportAuth |  | Get Cursor import status |
| POST | `/api/oauth/cursor/import` | requireManagementAuth+requireOAuthImportAuth |  | Import Cursor OAuth credentials |
| POST | `/api/oauth/cursor/login/cancel` | requireManagementAuth+requireOAuthAuth |  | POST oauth › cursor › login › cancel |
| POST | `/api/oauth/cursor/login/poll` | requireManagementAuth+requireOAuthAuth |  | POST oauth › cursor › login › poll |
| POST | `/api/oauth/cursor/login/start` | requireManagementAuth+requireOAuthAuth |  | POST oauth › cursor › login › start |
| POST | `/api/oauth/kiro/api-key` | requireManagementAuth |  | POST oauth › kiro › api key |
| GET | `/api/oauth/kiro/auto-import` | requireManagementAuth |  | Auto-import Kiro OAuth credentials |
| POST | `/api/oauth/kiro/import` | requireManagementAuth+requireOAuthImportAuth |  | Import Kiro OAuth credentials |
| GET | `/api/oauth/kiro/social-authorize` | requireManagementAuth |  | Initiate Kiro social OAuth authorization |
| POST | `/api/oauth/kiro/social-exchange` | requireManagementAuth |  | Exchange Kiro social OAuth token |
| POST | `/api/oauth/trae/authorize-state` | requireManagementAuth |  | POST oauth › trae › authorize state |
| GET | `/api/oauth/trae/import` | requireManagementAuth+requireOAuthImportAuth |  | GET oauth › trae › import |
| POST | `/api/oauth/trae/import` | requireManagementAuth+requireOAuthImportAuth |  | POST oauth › trae › import |
| POST | `/api/omniroute/route/preview` | requireManagementAuth |  | POST omniroute › route › preview |
| GET | `/api/omniroute/status` | requireManagementAuth |  | GET omniroute › status |
| GET | `/api/openapi/spec` | none-detected |  | Get OpenAPI specification catalog |
| POST | `/api/openapi/try` | requireManagementAuth |  | Proxy an API Explorer request to an OmniRoute endpoint |
| POST | `/api/playground/improve-prompt` | none-detected |  | Improve prompt via LLM |
| GET | `/api/playground/presets/{id}` | checkAuth |  | Get playground preset |
| PUT | `/api/playground/presets/{id}` | checkAuth |  | Update playground preset |
| DELETE | `/api/playground/presets/{id}` | checkAuth |  | Delete playground preset |
| GET | `/api/playground/presets` | checkAuth |  | List playground presets |
| POST | `/api/playground/presets` | checkAuth |  | Create playground preset |
| POST | `/api/playground/simulate-route` | none-detected |  | POST playground › simulate route |
| POST | `/api/plugins/{name}/activate` | requireManagementAuth |  | POST plugins › <name> › activate |
| GET | `/api/plugins/{name}/config` | requireManagementAuth |  | GET plugins › <name> › config |
| PUT | `/api/plugins/{name}/config` | requireManagementAuth |  | PUT plugins › <name> › config |
| POST | `/api/plugins/{name}/deactivate` | requireManagementAuth |  | POST plugins › <name> › deactivate |
| GET | `/api/plugins/{name}` | requireManagementAuth |  | GET plugins › <name> |
| DELETE | `/api/plugins/{name}` | requireManagementAuth |  | DELETE plugins › <name> |
| POST | `/api/plugins/marketplace/install` | requireManagementAuth |  | POST plugins › marketplace › install |
| GET | `/api/plugins/marketplace` | requireManagementAuth |  | GET plugins › marketplace |
| GET | `/api/plugins` | requireManagementAuth |  | GET plugins |
| POST | `/api/plugins` | requireManagementAuth |  | POST plugins |
| POST | `/api/plugins/scan` | requireManagementAuth |  | POST plugins › scan |
| GET | `/api/policies` | none-detected |  | List routing policies |
| POST | `/api/policies` | none-detected |  | Create routing policy |
| GET | `/api/pricing/defaults` | none-detected |  | Get default pricing |
| GET | `/api/pricing/models` | none-detected |  | Get pricing per model |
| GET | `/api/pricing` | requireManagementAuth |  | Get model pricing |
| PATCH | `/api/pricing` | requireManagementAuth |  |  |
| DELETE | `/api/pricing` | requireManagementAuth |  |  |
| GET | `/api/pricing/sync` | requireManagementAuth |  | GET pricing › sync |
| POST | `/api/pricing/sync` | requireManagementAuth |  | POST pricing › sync |
| DELETE | `/api/pricing/sync` | requireManagementAuth |  | DELETE pricing › sync |
| GET | `/api/pricing/unpriced-usage` | requireManagementAuth |  | List recent usage with no configured price |
| GET | `/api/provider-metrics` | none-detected |  | GET provider metrics |
| GET | `/api/provider-models` | requireManagementAuth |  | List provider models |
| POST | `/api/provider-models` | requireManagementAuth |  | Add a custom model |
| PUT | `/api/provider-models` | requireManagementAuth |  | Update model metadata or per-model overrides |
| PATCH | `/api/provider-models` | requireManagementAuth |  |  |
| DELETE | `/api/provider-models` | requireManagementAuth |  |  |
| POST | `/api/provider-models/validate-and-add` | requireManagementAuth |  | Validate and add a custom chat model on one exact connection |
| PUT | `/api/provider-nodes/{id}` | none-detected |  | Update provider node |
| DELETE | `/api/provider-nodes/{id}` | none-detected |  | Delete provider node |
| GET | `/api/provider-nodes` | none-detected |  | List provider nodes |
| POST | `/api/provider-nodes` | none-detected |  | Create provider node |
| POST | `/api/provider-nodes/validate` | requireManagementAuth |  | Validate a provider node |
| GET | `/api/provider-stats` | none-detected |  | GET provider stats |
| GET | `/api/providers/{id}/cc-alias` | requireManagementAuth |  | GET providers › <id> › cc alias |
| PUT | `/api/providers/{id}/cc-alias` | requireManagementAuth |  | PUT providers › <id> › cc alias |
| GET | `/api/providers/{id}/chatgpt-web-codex-doctor` | requireManagementAuth |  | GET providers › <id> › chatgpt web codex doctor |
| POST | `/api/providers/{id}/claude-auth/apply-local` | requireManagementAuth |  | POST providers › <id> › claude auth › apply local |
| POST | `/api/providers/{id}/claude-auth/export` | requireManagementAuth |  | POST providers › <id> › claude auth › export |
| POST | `/api/providers/{id}/codex-auth/apply-local` | requireManagementAuth |  | POST providers › <id> › codex auth › apply local |
| POST | `/api/providers/{id}/codex-auth/export` | requireManagementAuth |  | POST providers › <id> › codex auth › export |
| GET | `/api/providers/{id}/fal` | requireManagementAuth |  | Search Fal models or load a schema for a managed connection |
| PUT | `/api/providers/{id}/fal` | requireManagementAuth |  | Register a validated native Fal endpoint or schema override |
| DELETE | `/api/providers/{id}/fal` | requireManagementAuth |  | Remove a Fal endpoint override and cached schema |
| GET | `/api/providers/{id}/interception-rules` | requireManagementAuth |  | GET providers › <id> › interception rules |
| PUT | `/api/providers/{id}/interception-rules` | requireManagementAuth |  | PUT providers › <id> › interception rules |
| DELETE | `/api/providers/{id}/interception-rules` | requireManagementAuth |  | DELETE providers › <id> › interception rules |
| POST | `/api/providers/{id}/login` | requireManagementAuth |  | POST providers › <id> › login |
| GET | `/api/providers/{id}/models` | none-detected |  | List models for a provider |
| GET | `/api/providers/{id}/param-filters` | requireManagementAuth |  | GET providers › <id> › param filters |
| PUT | `/api/providers/{id}/param-filters` | requireManagementAuth |  | PUT providers › <id> › param filters |
| DELETE | `/api/providers/{id}/param-filters` | requireManagementAuth |  | DELETE providers › <id> › param filters |
| POST | `/api/providers/{id}/ping` | requireManagementAuth |  |  |
| POST | `/api/providers/{id}/refresh-cursor` | none-detected |  | POST providers › <id> › refresh cursor |
| POST | `/api/providers/{id}/refresh-token` | requireManagementAuth |  | POST providers › <id> › refresh token |
| POST | `/api/providers/{id}/refresh` | none-detected |  | POST providers › <id> › refresh |
| GET | `/api/providers/{id}` | requireManagementAuth |  | Get provider connection |
| PUT | `/api/providers/{id}` | requireManagementAuth |  |  |
| PATCH | `/api/providers/{id}` | requireManagementAuth |  | Update provider connection |
| DELETE | `/api/providers/{id}` | requireManagementAuth |  | Delete provider connection |
| POST | `/api/providers/{id}/sync-models` | isAuthenticated |  | POST providers › <id> › sync models |
| GET | `/api/providers/{id}/test-message` | requireManagementAuth |  | Read an account's saved test model and the global test message |
| POST | `/api/providers/{id}/test-message` | requireManagementAuth |  | Send one real test message through the selected account |
| PUT | `/api/providers/{id}/test-message` | requireManagementAuth |  | Save the chat model used by this account's test-message button |
| POST | `/api/providers/{id}/test` | none-detected |  | Test provider connection |
| POST | `/api/providers/agy-auth/apply-local` | requireManagementAuth |  | Auto-detect and import the local Antigravity CLI (agy) login from disk |
| POST | `/api/providers/agy-auth/import-bulk` | requireManagementAuth |  | Bulk-import multiple Antigravity CLI (agy) token files (up to 50) |
| POST | `/api/providers/agy-auth/import` | requireManagementAuth |  | Import an Antigravity CLI (agy) token file as an `agy` connection |
| POST | `/api/providers/agy-auth/zip-extract` | requireManagementAuth |  | Extract `.json` token files from an uploaded ZIP for agy bulk import |
| POST | `/api/providers/bulk-web-session` | requireManagementAuth |  | POST providers › bulk web session |
| POST | `/api/providers/bulk` | requireManagementAuth |  | POST providers › bulk |
| POST | `/api/providers/claude-auth/import-bulk` | requireManagementAuth |  | POST providers › claude auth › import bulk |
| POST | `/api/providers/claude-auth/import` | requireManagementAuth |  | POST providers › claude auth › import |
| POST | `/api/providers/claude-auth/zip-extract` | requireManagementAuth |  | POST providers › claude auth › zip extract |
| GET | `/api/providers/client` | none-detected |  | Get client-side provider info |
| POST | `/api/providers/codex-auth/import-bulk` | requireManagementAuth |  | POST providers › codex auth › import bulk |
| POST | `/api/providers/codex-auth/import` | requireManagementAuth |  | POST providers › codex auth › import |
| POST | `/api/providers/codex-auth/zip-extract` | requireManagementAuth |  | POST providers › codex auth › zip extract |
| POST | `/api/providers/codex-cooldown` | requireManagementAuth |  |  |
| POST | `/api/providers/command-code/auth/apply` | requireManagementAuth |  | POST providers › command code › auth › apply |
| POST | `/api/providers/command-code/auth/callback` | none-detected |  | POST providers › command code › auth › callback |
| POST | `/api/providers/command-code/auth/start` | requireManagementAuth |  | POST providers › command code › auth › start |
| GET | `/api/providers/command-code/auth/status` | requireManagementAuth |  | GET providers › command code › auth › status |
| POST | `/api/providers/command-code/auth/status` | requireManagementAuth |  | POST providers › command code › auth › status |
| GET | `/api/providers/cursor/agent-availability` | requireManagementAuth |  | Check cursor-agent availability |
| GET | `/api/providers/deprecated` | requireManagementAuth |  |  |
| POST | `/api/providers/deprecated` | requireManagementAuth |  |  |
| GET | `/api/providers/devin-cli-agentic/auth-status` | none-detected |  |  |
| GET | `/api/providers/expiration` | none-detected |  | GET providers › expiration |
| GET | `/api/providers/free-onboarding` | requireManagementAuth |  | GET providers › free onboarding |
| POST | `/api/providers/free-onboarding` | requireManagementAuth |  | POST providers › free onboarding |
| POST | `/api/providers/health-autopilot/actions` | requireManagementAuth |  | POST providers › health autopilot › actions |
| GET | `/api/providers/health-autopilot` | requireManagementAuth |  | GET providers › health autopilot |
| GET | `/api/providers/health-matrix` | requireManagementAuth |  | GET providers › health matrix |
| POST | `/api/providers/import` | requireManagementAuth |  | POST providers › import |
| GET | `/api/providers/openrouter-stats` | isAuthenticated |  | GET providers › openrouter stats |
| GET | `/api/providers/quota-windows` | requireManagementAuth |  | GET providers › quota windows |
| GET | `/api/providers` | requireManagementAuth |  | List provider connections |
| POST | `/api/providers` | requireManagementAuth |  | Create provider connection |
| PATCH | `/api/providers` | requireManagementAuth |  |  |
| DELETE | `/api/providers` | requireManagementAuth |  |  |
| POST | `/api/providers/test-batch` | requireManagementAuth |  | Test multiple providers at once |
| POST | `/api/providers/validate` | requireManagementAuth |  | Validate provider credentials |
| POST | `/api/providers/volcengine-plan/connect/{sessionId}/cancel` | requireManagementAuth |  | POST providers › volcengine plan › connect › <sessionId> › cancel |
| POST | `/api/providers/volcengine-plan/connect/{sessionId}/code` | requireManagementAuth |  | POST providers › volcengine plan › connect › <sessionId> › code |
| POST | `/api/providers/volcengine-plan/connect/{sessionId}/identity` | requireManagementAuth |  | POST providers › volcengine plan › connect › <sessionId> › identity |
| POST | `/api/providers/volcengine-plan/connect/{sessionId}/resend` | requireManagementAuth |  | POST providers › volcengine plan › connect › <sessionId> › resend |
| GET | `/api/providers/volcengine-plan/connect/{sessionId}/status` | requireManagementAuth |  | GET providers › volcengine plan › connect › <sessionId> › status |
| POST | `/api/providers/volcengine-plan/connect` | requireManagementAuth |  | POST providers › volcengine plan › connect |
| GET | `/api/providers/web-session-contract` | requireManagementAuth |  | GET providers › web session contract |
| POST | `/api/providers/zed/discover` | requireManagementAuth |  | POST providers › zed › discover |
| POST | `/api/providers/zed/import` | requireManagementAuth |  | POST providers › zed › import |
| POST | `/api/providers/zed/manual-import` | requireManagementAuth |  | POST providers › zed › manual import |
| POST | `/api/proxy-fallback/test` | requireManagementAuth |  | POST proxy fallback › test |
| PATCH | `/api/quota/groups/{id}` | requireManagementAuth |  | PATCH quota › groups › <id> |
| DELETE | `/api/quota/groups/{id}` | requireManagementAuth |  | DELETE quota › groups › <id> |
| GET | `/api/quota/groups` | requireManagementAuth |  | GET quota › groups |
| POST | `/api/quota/groups` | requireManagementAuth |  | POST quota › groups |
| GET | `/api/quota/keys/{id}/models` | requireManagementAuth |  | GET quota › keys › <id> › models |
| GET | `/api/quota/plans/{connectionId}` | requireManagementAuth |  | Get resolved plan for a connection |
| PUT | `/api/quota/plans/{connectionId}` | requireManagementAuth |  | Upsert manual plan override for a connection |
| DELETE | `/api/quota/plans/{connectionId}` | requireManagementAuth |  | Delete manual plan override (reverts to catalog/auto) |
| GET | `/api/quota/plans` | requireManagementAuth |  | List resolved provider plans (catalog + manual overrides) |
| GET | `/api/quota/pools/{id}/log` | requireManagementAuth |  | GET quota › pools › <id> › log |
| GET | `/api/quota/pools/{id}` | requireManagementAuth |  | Get quota pool by ID |
| PATCH | `/api/quota/pools/{id}` | requireManagementAuth |  | Update quota pool (name or allocations) |
| DELETE | `/api/quota/pools/{id}` | requireManagementAuth |  | Delete quota pool |
| GET | `/api/quota/pools/{id}/schedules` | requireManagementAuth |  |  |
| PUT | `/api/quota/pools/{id}/schedules` | requireManagementAuth |  |  |
| GET | `/api/quota/pools/{id}/usage` | requireManagementAuth |  | Get pool usage snapshot (per-key consumption + burn rate) |
| GET | `/api/quota/pools` | requireManagementAuth |  | List quota pools |
| POST | `/api/quota/pools` | requireManagementAuth |  | Create quota pool |
| GET | `/api/quota/preview` | requireManagementAuth |  | Dry-run quota enforcement check (preview only, no consumption recorded) |
| GET | `/api/radar/catalog` | isAuthenticated |  | GET radar › catalog |
| GET | `/api/radar/intel` | isAuthenticated |  | GET radar › intel |
| POST | `/api/radar/intel/sync` | none-detected |  | POST radar › intel › sync |
| GET | `/api/radar/local-model-state` | isAuthenticated |  | GET radar › local model state |
| PUT | `/api/radar/local-model-state` | isAuthenticated |  | PUT radar › local model state |
| PATCH | `/api/radar/local-model-state` | isAuthenticated |  | PATCH radar › local model state |
| DELETE | `/api/radar/local-model-state` | isAuthenticated |  | DELETE radar › local model state |
| GET | `/api/radar/offers` | isAuthenticated |  | GET radar › offers |
| POST | `/api/radar/offers/sync` | none-detected |  | POST radar › offers › sync |
| GET | `/api/radar/referrals` | isAuthenticated |  | GET radar › referrals |
| GET | `/api/radar/settings` | isAuthenticated |  | GET radar › settings |
| POST | `/api/radar/settings` | isAuthenticated |  | POST radar › settings |
| GET | `/api/radar/status` | isAuthenticated |  | GET radar › status |
| POST | `/api/radar/sync-all` | isAuthenticated |  | POST radar › sync all |
| POST | `/api/radar/sync` | isAuthenticated |  | POST radar › sync |
| GET | `/api/rate-limit` | none-detected |  | Get rate limit configuration |
| POST | `/api/rate-limit` | none-detected |  | Update rate limit configuration |
| GET | `/api/rate-limits` | none-detected |  | Get per-account rate limit status |
| POST | `/api/rate-limits` | none-detected |  | Toggle rate limit protection for a connection |
| GET | `/api/relay/tokens/{id}` | requireManagementAuth |  | GET relay › tokens › <id> |
| PATCH | `/api/relay/tokens/{id}` | requireManagementAuth |  | PATCH relay › tokens › <id> |
| DELETE | `/api/relay/tokens/{id}` | requireManagementAuth |  | DELETE relay › tokens › <id> |
| GET | `/api/relay/tokens` | requireManagementAuth |  | GET relay › tokens |
| POST | `/api/relay/tokens` | requireManagementAuth |  | POST relay › tokens |
| GET | `/api/resilience/connections` | none-detected |  | Inspect connection resilience state |
| GET | `/api/resilience/cooldowns` | requireManagementAuth |  | GET resilience › cooldowns |
| POST | `/api/resilience/cooldowns` | requireManagementAuth |  | POST resilience › cooldowns |
| GET | `/api/resilience/model-cooldowns` | requireManagementAuth |  | GET resilience › model cooldowns |
| DELETE | `/api/resilience/model-cooldowns` | requireManagementAuth |  | DELETE resilience › model cooldowns |
| POST | `/api/resilience/reset` | requireManagementAuth |  | Reset circuit breakers |
| GET | `/api/resilience` | none-detected |  | Get resilience configuration |
| PATCH | `/api/resilience` | none-detected |  | Update resilience configuration |
| POST | `/api/restart` | requireManagementAuth |  | Restart the application |
| GET | `/api/routing/decisions/{requestId}` | requireManagementAuth |  | GET routing › decisions › <requestId> |
| GET | `/api/search/providers` | isAuthenticated |  | GET search › providers |
| GET | `/api/search/stats` | isAuthenticated |  | GET search › stats |
| POST | `/api/services/9router/auto-restart-adopted` | none-detected |  | Toggle 9Router auto-restart-when-adopted |
| POST | `/api/services/9router/auto-start` | none-detected |  | Toggle 9Router auto-start |
| POST | `/api/services/9router/install` | none-detected |  | Install 9Router from npm |
| GET | `/api/services/9router/models` | none-detected |  | GET services › 9router › models |
| POST | `/api/services/9router/provider-expose` | none-detected |  | POST services › 9router › provider expose |
| POST | `/api/services/9router/restart` | none-detected |  | Restart 9Router |
| POST | `/api/services/9router/rotate-key` | none-detected |  | Rotate the 9Router API key |
| POST | `/api/services/9router/start` | none-detected |  | Start 9Router |
| GET | `/api/services/9router/status` | requireManagementAuth |  | Get 9Router status |
| POST | `/api/services/9router/stop` | none-detected |  | Stop 9Router |
| POST | `/api/services/9router/update` | none-detected |  | Update 9Router to a newer npm version |
| GET | `/api/services/{name}/logs` | none-detected | yes | Stream service logs via SSE |
| POST | `/api/services/bifrost/auto-restart-adopted` | none-detected |  | Toggle Bifrost auto-restart-when-adopted |
| POST | `/api/services/bifrost/auto-start` | none-detected |  | Toggle Bifrost auto-start |
| POST | `/api/services/bifrost/install` | none-detected |  | Install Bifrost |
| POST | `/api/services/bifrost/restart` | none-detected |  | Restart Bifrost |
| POST | `/api/services/bifrost/start` | none-detected |  | Start Bifrost |
| GET | `/api/services/bifrost/status` | none-detected |  | Get Bifrost status |
| POST | `/api/services/bifrost/stop` | none-detected |  | Stop Bifrost |
| POST | `/api/services/bifrost/update` | none-detected |  | Update Bifrost |
| GET | `/api/services/cliproxy/accounts` | isAuthenticated |  | GET services › cliproxy › accounts |
| POST | `/api/services/cliproxy/auto-restart-adopted` | none-detected |  | Toggle CLIProxyAPI auto-restart-when-adopted |
| POST | `/api/services/cliproxy/auto-start` | none-detected |  | Toggle CLIProxyAPI auto-start |
| POST | `/api/services/cliproxy/install` | none-detected |  | Install CLIProxyAPI from npm |
| POST | `/api/services/cliproxy/provider-expose` | none-detected |  | POST services › cliproxy › provider expose |
| POST | `/api/services/cliproxy/restart` | none-detected |  | Restart CLIProxyAPI |
| POST | `/api/services/cliproxy/start` | none-detected |  | Start CLIProxyAPI |
| GET | `/api/services/cliproxy/status` | none-detected |  | Get CLIProxyAPI status |
| POST | `/api/services/cliproxy/stop` | none-detected |  | Stop CLIProxyAPI |
| POST | `/api/services/cliproxy/update` | none-detected |  | Update CLIProxyAPI to a newer npm version |
| GET | `/api/services/dario/admin/accounts` | requireAdminAuth |  | List Dario account-pool accounts |
| DELETE | `/api/services/dario/admin/accounts` | requireAdminAuth |  | Remove a Dario account-pool account |
| GET | `/api/services/dario/admin/import-from-omniroute` | requireAdminAuth |  | List OmniRoute claude connections eligible for Dario import |
| POST | `/api/services/dario/admin/import-from-omniroute` | requireAdminAuth |  | Import an OmniRoute claude connection's OAuth tokens into Dario |
| POST | `/api/services/dario/admin/login-complete` | requireAdminAuth |  | Complete a Dario account-pool login |
| POST | `/api/services/dario/admin/login-start` | requireAdminAuth |  | Start a Dario account-pool login (device-code style) |
| POST | `/api/services/dario/auto-restart-adopted` | none-detected |  | Toggle Dario auto-restart-when-adopted |
| POST | `/api/services/dario/auto-start` | none-detected |  | Toggle Dario auto-start |
| POST | `/api/services/dario/install` | none-detected |  | Install Dario from npm |
| POST | `/api/services/dario/restart` | none-detected |  | Restart Dario |
| POST | `/api/services/dario/start` | none-detected |  | Start Dario |
| GET | `/api/services/dario/status` | none-detected |  | Get Dario status |
| POST | `/api/services/dario/stop` | none-detected |  | Stop Dario |
| POST | `/api/services/dario/update` | none-detected |  | Update Dario to a newer npm version |
| POST | `/api/services/llmlingua/auto-restart-adopted` | none-detected |  | Toggle LLMLingua auto-restart-when-adopted |
| POST | `/api/services/llmlingua/auto-start` | none-detected |  | Toggle LLMLingua auto-start |
| POST | `/api/services/llmlingua/install` | none-detected |  | Install LLMLingua |
| POST | `/api/services/llmlingua/restart` | none-detected |  | Restart LLMLingua |
| POST | `/api/services/llmlingua/start` | none-detected |  | Start LLMLingua |
| GET | `/api/services/llmlingua/status` | none-detected |  | Get LLMLingua status |
| POST | `/api/services/llmlingua/stop` | none-detected |  | Stop LLMLingua |
| POST | `/api/services/llmlingua/update` | none-detected |  | Update LLMLingua |
| POST | `/api/services/mux/auto-restart-adopted` | none-detected |  | Toggle Mux auto-restart-when-adopted |
| POST | `/api/services/mux/auto-start` | none-detected |  | Toggle Mux auto-start |
| POST | `/api/services/mux/install` | none-detected |  | Install Mux from npm |
| POST | `/api/services/mux/restart` | none-detected |  | Restart Mux |
| POST | `/api/services/mux/start` | none-detected |  | Start Mux |
| GET | `/api/services/mux/status` | none-detected |  | Get Mux status |
| POST | `/api/services/mux/stop` | none-detected |  | Stop Mux |
| POST | `/api/services/mux/update` | none-detected |  | Update Mux to a newer npm version |
| POST | `/api/services/opencode-server/start` | none-detected |  |  |
| GET | `/api/services/opencode-server/status` | none-detected |  |  |
| POST | `/api/services/opencode-server/stop` | none-detected |  |  |
| POST | `/api/services/openwa/auto-restart-adopted` | none-detected |  | Toggle open-wa auto-restart-when-adopted |
| POST | `/api/services/openwa/auto-start` | none-detected |  | Toggle open-wa auto-start |
| POST | `/api/services/openwa/install` | none-detected |  | Install open-wa from npm |
| POST | `/api/services/openwa/restart` | none-detected |  | Restart open-wa |
| POST | `/api/services/openwa/start` | none-detected |  | Start open-wa |
| GET | `/api/services/openwa/status` | none-detected |  | Get open-wa status |
| POST | `/api/services/openwa/stop` | none-detected |  | Stop open-wa |
| POST | `/api/services/openwa/update` | none-detected |  | Update open-wa to a newer npm version |
| POST | `/api/services/singbox/auto-restart-adopted` | none-detected |  | Toggle sing-box auto-restart-when-adopted |
| POST | `/api/services/singbox/auto-start` | none-detected |  | Toggle sing-box auto-start |
| POST | `/api/services/singbox/install` | none-detected |  | Install sing-box |
| POST | `/api/services/singbox/restart` | none-detected |  | Restart sing-box |
| POST | `/api/services/singbox/start` | none-detected |  | Start sing-box |
| GET | `/api/services/singbox/status` | none-detected |  | Get sing-box status |
| POST | `/api/services/singbox/stop` | none-detected |  | Stop sing-box |
| POST | `/api/services/singbox/update` | none-detected |  | Re-verify/reinstall the pinned sing-box release |
| GET | `/api/session-pools/{provider}` | requireManagementAuth |  | GET session pools › <provider> |
| GET | `/api/session-pools` | requireManagementAuth |  | GET session pools |
| GET | `/api/sessions` | none-detected |  | Get active sessions |
| GET | `/api/settings/authz-inventory` | requireInventoryReadAuth |  | GET settings › authz inventory |
| GET | `/api/settings/auto-disable-accounts` | requireManagementAuth |  | GET settings › auto disable accounts |
| PUT | `/api/settings/auto-disable-accounts` | requireManagementAuth |  | PUT settings › auto disable accounts |
| GET | `/api/settings/background-degradation` | requireManagementAuth |  | GET settings › background degradation |
| POST | `/api/settings/background-degradation` | requireManagementAuth |  | POST settings › background degradation |
| PUT | `/api/settings/background-degradation` | requireManagementAuth |  | PUT settings › background degradation |
| GET | `/api/settings/banked-reset-auto/history` | requireManagementAuth |  |  |
| GET | `/api/settings/cache-config/embedding-options` | isAuthenticated |  |  |
| GET | `/api/settings/cache-config` | isAuthenticated |  | GET settings › cache config |
| PUT | `/api/settings/cache-config` | isAuthenticated |  | PUT settings › cache config |
| POST | `/api/settings/cache-config/test-embedding` | isAuthenticated |  |  |
| GET | `/api/settings/cache-metrics` | requireManagementAuth |  | GET settings › cache metrics |
| DELETE | `/api/settings/cache-metrics` | requireManagementAuth |  | DELETE settings › cache metrics |
| GET | `/api/settings/cc-discovery-metrics` | requireManagementAuth |  | GET settings › cc discovery metrics |
| GET | `/api/settings/cli-versions` | requireManagementAuth |  | Get advertised CLI client versions |
| PUT | `/api/settings/cli-versions` | requireManagementAuth |  | Set advertised CLI client versions |
| GET | `/api/settings/codex-wakeups` | requireManagementAuth |  |  |
| POST | `/api/settings/codex-wakeups` | requireManagementAuth |  |  |
| GET | `/api/settings/combo-defaults` | requireManagementAuth |  | Get combo default settings |
| PATCH | `/api/settings/combo-defaults` | requireManagementAuth |  |  |
| GET | `/api/settings/compression/mcp-accessibility` | isAuthenticated |  | Get the MCP tool-output accessibility (trimming) config |
| PUT | `/api/settings/compression/mcp-accessibility` | isAuthenticated |  | Update the MCP tool-output accessibility (trimming) config |
| GET | `/api/settings/compression` | isAuthenticated |  | Get global compression settings |
| PUT | `/api/settings/compression` | isAuthenticated |  | Update global compression settings |
| GET | `/api/settings/compression/rules` | none-detected |  | GET settings › compression › rules |
| GET | `/api/settings/compression/run-telemetry` | isAuthenticated |  | GET settings › compression › run telemetry |
| POST | `/api/settings/database/integrity-check` | isAuthenticated |  | POST settings › database › integrity check |
| POST | `/api/settings/database/refresh-stats` | isAuthenticated |  | POST settings › database › refresh stats |
| GET | `/api/settings/database` | isAuthenticated |  | GET settings › database |
| PUT | `/api/settings/database` | isAuthenticated |  | PUT settings › database |
| PATCH | `/api/settings/database` | isAuthenticated |  | PATCH settings › database |
| GET | `/api/settings/database/vacuum` | isAuthenticated |  | GET settings › database › vacuum |
| POST | `/api/settings/database/vacuum` | isAuthenticated |  | POST settings › database › vacuum |
| GET | `/api/settings/export-json` | none-detected |  | GET settings › export json |
| GET | `/api/settings/favicon` | none-detected |  | GET settings › favicon |
| GET | `/api/settings/feature-flags` | requireManagementAuth+isAuthenticated |  | GET settings › feature flags |
| PUT | `/api/settings/feature-flags` | requireManagementAuth+isAuthenticated |  | PUT settings › feature flags |
| DELETE | `/api/settings/feature-flags` | requireManagementAuth+isAuthenticated |  | DELETE settings › feature flags |
| POST | `/api/settings/free-proxies/{id}/add-to-pool` | requireManagementAuth |  | POST settings › free proxies › <id> › add to pool |
| POST | `/api/settings/free-proxies/bulk-add-to-pool` | requireManagementAuth |  | POST settings › free proxies › bulk add to pool |
| GET | `/api/settings/free-proxies` | requireManagementAuth |  | GET settings › free proxies |
| DELETE | `/api/settings/free-proxies` | requireManagementAuth |  | DELETE settings › free proxies |
| GET | `/api/settings/free-proxies/stats` | requireManagementAuth |  | GET settings › free proxies › stats |
| POST | `/api/settings/free-proxies/sync` | requireManagementAuth |  | POST settings › free proxies › sync |
| POST | `/api/settings/import-json` | none-detected |  | POST settings › import json |
| GET | `/api/settings/ip-filter` | requireManagementAuth |  | Get IP filter configuration |
| PUT | `/api/settings/ip-filter` | requireManagementAuth |  | Update IP filter configuration |
| DELETE | `/api/settings/lkgp-cache` | isAuthenticated |  | DELETE settings › lkgp cache |
| GET | `/api/settings/local-corpus` | isAuthenticated |  | GET settings › local corpus |
| POST | `/api/settings/local-corpus` | isAuthenticated |  | POST settings › local corpus |
| DELETE | `/api/settings/local-corpus` | isAuthenticated |  | DELETE settings › local corpus |
| GET | `/api/settings/memory` | isAuthenticated |  | Get memory settings |
| PUT | `/api/settings/memory` | isAuthenticated |  | Update memory settings |
| GET | `/api/settings/mitm` | requireManagementAuth |  | GET settings › mitm |
| POST | `/api/settings/mitm` | requireManagementAuth |  | POST settings › mitm |
| PUT | `/api/settings/mitm` | requireManagementAuth |  | PUT settings › mitm |
| GET | `/api/settings/model-aliases` | requireManagementAuth |  | GET settings › model aliases |
| POST | `/api/settings/model-aliases` | requireManagementAuth |  | POST settings › model aliases |
| PUT | `/api/settings/model-aliases` | requireManagementAuth |  | PUT settings › model aliases |
| DELETE | `/api/settings/model-aliases` | requireManagementAuth |  | DELETE settings › model aliases |
| GET | `/api/settings/models-dev` | isAuthenticated |  | GET settings › models dev |
| POST | `/api/settings/models-dev` | isAuthenticated |  | POST settings › models dev |
| GET | `/api/settings/notion` | isAuthenticated |  | GET settings › notion |
| POST | `/api/settings/notion` | isAuthenticated |  | POST settings › notion |
| DELETE | `/api/settings/notion` | isAuthenticated |  | DELETE settings › notion |
| GET | `/api/settings/obsidian` | isAuthenticated |  | GET settings › obsidian |
| POST | `/api/settings/obsidian` | isAuthenticated |  | POST settings › obsidian |
| DELETE | `/api/settings/obsidian` | isAuthenticated |  | DELETE settings › obsidian |
| GET | `/api/settings/obsidian/webdav` | requireManagementAuth+isAuthenticated |  | GET settings › obsidian › webdav |
| POST | `/api/settings/obsidian/webdav` | requireManagementAuth+isAuthenticated |  | POST settings › obsidian › webdav |
| DELETE | `/api/settings/obsidian/webdav` | requireManagementAuth+isAuthenticated |  | DELETE settings › obsidian › webdav |
| POST | `/api/settings/oneproxy/rotate` | requireManagementAuth |  | POST settings › oneproxy › rotate |
| GET | `/api/settings/oneproxy` | requireManagementAuth |  | GET settings › oneproxy |
| POST | `/api/settings/oneproxy` | requireManagementAuth |  | POST settings › oneproxy |
| DELETE | `/api/settings/oneproxy` | requireManagementAuth |  | DELETE settings › oneproxy |
| GET | `/api/settings/payload-rules` | requireManagementAuth |  | Get payload rules configuration |
| PUT | `/api/settings/payload-rules` | requireManagementAuth |  | Update payload rules configuration |
| GET | `/api/settings/pii` | requireManagementAuth |  | Get PII masking settings |
| PUT | `/api/settings/pii` | requireManagementAuth |  | Update PII masking settings |
| POST | `/api/settings/pii/test` | requireManagementAuth |  | Test a custom PII pattern |
| POST | `/api/settings/proxies/{id}/repair-relay` | requireManagementAuth |  | POST settings › proxies › <id> › repair relay |
| GET | `/api/settings/proxies/assignments` | requireManagementAuth |  | GET settings › proxies › assignments |
| PUT | `/api/settings/proxies/assignments` | requireManagementAuth |  | PUT settings › proxies › assignments |
| POST | `/api/settings/proxies/auto-test` | requireManagementAuth |  | POST settings › proxies › auto test |
| POST | `/api/settings/proxies/batch-activate` | requireManagementAuth |  | POST settings › proxies › batch activate |
| POST | `/api/settings/proxies/batch-delete` | requireManagementAuth |  | POST settings › proxies › batch delete |
| PUT | `/api/settings/proxies/bulk-assign` | none-detected |  | PUT settings › proxies › bulk assign |
| POST | `/api/settings/proxies/bulk-import` | requireManagementAuth |  | POST settings › proxies › bulk import |
| GET | `/api/settings/proxies/egress` | requireManagementAuth |  | GET settings › proxies › egress |
| POST | `/api/settings/proxies/egress` | requireManagementAuth |  | POST settings › proxies › egress |
| GET | `/api/settings/proxies/health` | none-detected |  | GET settings › proxies › health |
| POST | `/api/settings/proxies/migrate` | requireManagementAuth |  | POST settings › proxies › migrate |
| POST | `/api/settings/proxies/operator-egress` | requireManagementAuth |  |  |
| GET | `/api/settings/proxies/pool/egress-observation` | requireManagementAuth |  | GET settings › proxies › pool › egress observation |
| GET | `/api/settings/proxies/pool/member-egress` | requireManagementAuth |  |  |
| GET | `/api/settings/proxies/pool` | requireManagementAuth |  | GET settings › proxies › pool |
| PUT | `/api/settings/proxies/pool` | requireManagementAuth |  | PUT settings › proxies › pool |
| PATCH | `/api/settings/proxies/pool` | requireManagementAuth |  | PATCH settings › proxies › pool |
| DELETE | `/api/settings/proxies/pool` | requireManagementAuth |  | DELETE settings › proxies › pool |
| GET | `/api/settings/proxies/pool/uniform-egress` | requireManagementAuth |  |  |
| GET | `/api/settings/proxies` | requireManagementAuth |  | GET settings › proxies |
| POST | `/api/settings/proxies` | requireManagementAuth |  | POST settings › proxies |
| PATCH | `/api/settings/proxies` | requireManagementAuth |  | PATCH settings › proxies |
| DELETE | `/api/settings/proxies` | requireManagementAuth |  | DELETE settings › proxies |
| GET | `/api/settings/proxies/traffic` | requireManagementAuth |  |  |
| POST | `/api/settings/proxy/cloudflare-deploy` | requireManagementAuth |  | POST settings › proxy › cloudflare deploy |
| POST | `/api/settings/proxy/deno-deploy` | requireManagementAuth |  | POST settings › proxy › deno deploy |
| GET | `/api/settings/proxy` | requireManagementAuth |  | Get proxy settings |
| PUT | `/api/settings/proxy` | requireManagementAuth |  | Update proxy settings |
| DELETE | `/api/settings/proxy` | requireManagementAuth |  |  |
| POST | `/api/settings/proxy/test` | requireManagementAuth |  | Test proxy connection |
| POST | `/api/settings/proxy/vercel-deploy` | requireManagementAuth |  | POST settings › proxy › vercel deploy |
| POST | `/api/settings/purge-call-logs` | isAuthenticated |  | POST settings › purge call logs |
| POST | `/api/settings/purge-detailed-logs` | isAuthenticated |  | POST settings › purge detailed logs |
| POST | `/api/settings/purge-logs` | isAuthenticated |  | POST settings › purge logs |
| POST | `/api/settings/purge-quota-snapshots` | isAuthenticated |  | POST settings › purge quota snapshots |
| POST | `/api/settings/purge-request-history` | isAuthenticated |  | Clear request log history |
| POST | `/api/settings/purge-usage-history` | isAuthenticated |  | Purge usage history |
| POST | `/api/settings/qdrant/cleanup` | isAuthenticated |  | Clean up expired Qdrant points |
| GET | `/api/settings/qdrant/embedding-models` | isAuthenticated |  | List Qdrant embedding models |
| GET | `/api/settings/qdrant/health` | isAuthenticated |  | Qdrant health probe |
| GET | `/api/settings/qdrant` | isAuthenticated |  | Get Qdrant settings |
| PUT | `/api/settings/qdrant` | isAuthenticated |  | Update Qdrant settings |
| POST | `/api/settings/qdrant/search` | isAuthenticated |  | Qdrant semantic search test |
| GET | `/api/settings/quota-store` | requireManagementAuth |  | Get current quota store driver settings |
| PUT | `/api/settings/quota-store` | requireManagementAuth |  | Update quota store driver settings |
| GET | `/api/settings/quota/state` | requireManagementAuth |  | GET settings › quota › state |
| POST | `/api/settings/quota/state` | requireManagementAuth |  | POST settings › quota › state |
| GET | `/api/settings/reasoning-routing-rules/{id}` | requireManagementAuth |  | GET settings › reasoning routing rules › <id> |
| PATCH | `/api/settings/reasoning-routing-rules/{id}` | requireManagementAuth |  | PATCH settings › reasoning routing rules › <id> |
| DELETE | `/api/settings/reasoning-routing-rules/{id}` | requireManagementAuth |  | DELETE settings › reasoning routing rules › <id> |
| GET | `/api/settings/reasoning-routing-rules` | requireManagementAuth |  | GET settings › reasoning routing rules |
| POST | `/api/settings/reasoning-routing-rules` | requireManagementAuth |  | POST settings › reasoning routing rules |
| POST | `/api/settings/reasoning-routing-rules/simulate` | requireManagementAuth |  | POST settings › reasoning routing rules › simulate |
| GET | `/api/settings/require-login` | none-detected |  |  |
| POST | `/api/settings/require-login` | none-detected |  | Set the management password and/or toggle the login requirement |
| GET | `/api/settings` | requireManagementAuth |  | Get application settings |
| PUT | `/api/settings` | requireManagementAuth |  |  |
| PATCH | `/api/settings` | requireManagementAuth |  | Update settings |
| GET | `/api/settings/system-prompt` | requireManagementAuth |  | Get system prompt configuration |
| PUT | `/api/settings/system-prompt` | requireManagementAuth |  | Update system prompt configuration |
| GET | `/api/settings/task-routing` | requireManagementAuth |  | GET settings › task routing |
| POST | `/api/settings/task-routing` | requireManagementAuth |  | POST settings › task routing |
| PUT | `/api/settings/task-routing` | requireManagementAuth |  | PUT settings › task routing |
| GET | `/api/settings/thinking-budget` | requireManagementAuth |  | Get thinking budget configuration |
| PUT | `/api/settings/thinking-budget` | requireManagementAuth |  | Update thinking budget configuration |
| GET | `/api/settings/tier-config` | requireManagementAuth |  | GET settings › tier config |
| PUT | `/api/settings/tier-config` | requireManagementAuth |  | PUT settings › tier config |
| GET | `/api/settings/transfer/catalog` | none-detected |  | GET settings › transfer › catalog |
| POST | `/api/settings/transfer/export` | none-detected |  | POST settings › transfer › export |
| POST | `/api/settings/transfer/import` | none-detected |  | POST settings › transfer › import |
| POST | `/api/settings/transfer/preview` | none-detected |  | POST settings › transfer › preview |
| POST | `/api/shutdown` | requireManagementAuth |  | Shutdown the application |
| PUT | `/api/skills/{id}` | requireManagementAuth |  | PUT skills › <id> |
| DELETE | `/api/skills/{id}` | requireManagementAuth |  | DELETE skills › <id> |
| POST | `/api/skills/collect/chaos` | none-detected |  | POST skills › collect › chaos |
| GET | `/api/skills/collect/detect` | requireManagementAuth |  | GET skills › collect › detect |
| POST | `/api/skills/collect/install` | requireManagementAuth |  | POST skills › collect › install |
| GET | `/api/skills/executions` | isAuthenticated |  | GET skills › executions |
| POST | `/api/skills/executions` | isAuthenticated |  | POST skills › executions |
| POST | `/api/skills/install` | requireManagementAuth |  | POST skills › install |
| POST | `/api/skills/marketplace/install` | requireManagementAuth |  | POST skills › marketplace › install |
| GET | `/api/skills/marketplace` | isAuthenticated |  | GET skills › marketplace |
| GET | `/api/skills` | requireManagementAuth |  | GET skills |
| POST | `/api/skills/skillssh/install` | requireManagementAuth |  | POST skills › skillssh › install |
| GET | `/api/skills/skillssh` | isAuthenticated |  | GET skills › skillssh |
| GET | `/api/storage/health` | none-detected |  | Check storage health |
| GET | `/api/sync/bundle` | none-detected |  | GET sync › bundle |
| GET | `/api/sync/cloud` | isAuthenticated |  |  |
| POST | `/api/sync/cloud` | isAuthenticated |  | Sync with cloud |
| GET | `/api/sync/initialize` | none-detected |  |  |
| POST | `/api/sync/initialize` | none-detected |  | Initialize cloud sync |
| DELETE | `/api/sync/tokens/{id}` | requireManagementAuth |  | DELETE sync › tokens › <id> |
| GET | `/api/sync/tokens` | requireManagementAuth |  | GET sync › tokens |
| POST | `/api/sync/tokens` | requireManagementAuth |  | POST sync › tokens |
| GET | `/api/synced-available-models` | isAuthenticated |  | GET synced available models |
| GET | `/api/system/env/repair` | isAuthenticated |  | GET system › env › repair |
| POST | `/api/system/env/repair` | isAuthenticated |  | POST system › env › repair |
| GET | `/api/system/metrics` | none-detected |  | Host and OmniRoute process CPU and memory |
| GET | `/api/system/version` | isAuthenticated | yes | GET system › version |
| POST | `/api/system/version` | isAuthenticated | yes | POST system › version |
| GET | `/api/tags` | none-detected |  | List Ollama-compatible model tags |
| GET | `/api/teams/{id}/members` | requireManagementAuth |  | List active API-key billing assignments |
| PUT | `/api/teams/{id}/members` | requireManagementAuth |  | Assign an API key to this billing Team |
| DELETE | `/api/teams/{id}/members` | requireManagementAuth |  | Close an API-key billing assignment |
| GET | `/api/teams/{id}` | requireManagementAuth |  | Get a billing Team and its active API-key assignments |
| PATCH | `/api/teams/{id}` | requireManagementAuth |  | Update a billing Team |
| DELETE | `/api/teams/{id}` | requireManagementAuth |  | Archive a billing Team and close its active key assignments |
| GET | `/api/teams/{id}/usage` | requireManagementAuth |  | Get immutable Team usage attribution with per-key drill-down |
| GET | `/api/teams` | requireManagementAuth |  | List billing Teams |
| POST | `/api/teams` | requireManagementAuth |  | Create a billing Team with an optional soft shared budget |
| POST | `/api/telegram/update` | none-detected |  | Receive Telegram updates or Mini App messages |
| GET | `/api/telemetry/summary` | none-detected |  | Get telemetry summary |
| GET | `/api/token-health` | requireManagementAuth |  | Get token health status |
| POST | `/api/token-health` | requireManagementAuth |  |  |
| GET | `/api/tools/agent-bridge/agents/{id}/detect` | none-detected |  | GET tools › agent bridge › agents › <id> › detect |
| GET | `/api/tools/agent-bridge/agents/{id}/detected-models` | none-detected |  | GET tools › agent bridge › agents › <id> › detected models |
| POST | `/api/tools/agent-bridge/agents/{id}/dns` | none-detected |  |  |
| GET | `/api/tools/agent-bridge/agents/{id}/mappings` | none-detected |  |  |
| PUT | `/api/tools/agent-bridge/agents/{id}/mappings` | none-detected |  |  |
| POST | `/api/tools/agent-bridge/agents/{id}/reset` | none-detected |  |  |
| GET | `/api/tools/agent-bridge/agents/{id}` | none-detected |  | GET tools › agent bridge › agents › <id> |
| PATCH | `/api/tools/agent-bridge/agents/{id}` | none-detected |  | PATCH tools › agent bridge › agents › <id> |
| GET | `/api/tools/agent-bridge/agents` | none-detected |  | List all 9 IDE agents with current state |
| GET | `/api/tools/agent-bridge/bypass` | none-detected |  | List bypass patterns (hosts never decrypted) |
| POST | `/api/tools/agent-bridge/bypass` | none-detected |  |  |
| DELETE | `/api/tools/agent-bridge/bypass` | none-detected |  |  |
| GET | `/api/tools/agent-bridge/cert/download` | none-detected |  | GET tools › agent bridge › cert › download |
| POST | `/api/tools/agent-bridge/cert/regenerate` | none-detected |  | POST tools › agent bridge › cert › regenerate |
| GET | `/api/tools/agent-bridge/cert` | none-detected |  |  |
| POST | `/api/tools/agent-bridge/cert` | none-detected |  | Download or regenerate the AgentBridge CA certificate |
| DELETE | `/api/tools/agent-bridge/cert` | none-detected |  |  |
| GET | `/api/tools/agent-bridge/config` | none-detected |  | GET tools › agent bridge › config |
| POST | `/api/tools/agent-bridge/config` | none-detected |  | POST tools › agent bridge › config |
| GET | `/api/tools/agent-bridge/diagnose` | none-detected |  | GET tools › agent bridge › diagnose |
| POST | `/api/tools/agent-bridge/repair` | none-detected |  | POST tools › agent bridge › repair |
| POST | `/api/tools/agent-bridge/server` | none-detected |  | Control AgentBridge MITM server |
| GET | `/api/tools/agent-bridge/state` | none-detected |  | Get global AgentBridge server state |
| GET | `/api/tools/agent-bridge/tproxy` | none-detected |  | GET tools › agent bridge › tproxy |
| POST | `/api/tools/agent-bridge/tproxy` | none-detected |  | POST tools › agent bridge › tproxy |
| DELETE | `/api/tools/agent-bridge/tproxy` | none-detected |  | DELETE tools › agent bridge › tproxy |
| GET | `/api/tools/agent-bridge/upstream-ca` | none-detected |  | Get configured upstream CA cert path |
| POST | `/api/tools/agent-bridge/upstream-ca` | none-detected |  | Set upstream CA cert path for corporate TLS environments |
| POST | `/api/tools/agent-bridge/upstream-ca/test` | none-detected |  | POST tools › agent bridge › upstream ca › test |
| POST | `/api/tools/traffic-inspector/capture-modes/http-proxy` | none-detected |  | Start or stop the HTTP_PROXY listener (port 8080) |
| GET | `/api/tools/traffic-inspector/capture-modes` | none-detected |  | Get state of all 4 capture modes |
| POST | `/api/tools/traffic-inspector/capture-modes/system-proxy` | none-detected |  | Apply or revert system-wide proxy settings |
| GET | `/api/tools/traffic-inspector/export.har` | none-detected |  | Export current filtered request list as HAR 1.2 |
| PATCH | `/api/tools/traffic-inspector/hosts/{host}` | none-detected |  | Toggle enabled state of a custom host |
| DELETE | `/api/tools/traffic-inspector/hosts/{host}` | none-detected |  | Remove a custom capture host |
| GET | `/api/tools/traffic-inspector/hosts` | none-detected |  | List custom capture hosts |
| POST | `/api/tools/traffic-inspector/hosts` | none-detected |  | Add a custom capture host (edits /etc/hosts) |
| POST | `/api/tools/traffic-inspector/internal/ingest` | none-detected |  | Internal ingest endpoint for server.cjs passthrough path |
| PUT | `/api/tools/traffic-inspector/requests/{id}/annotation` | none-detected |  | Save or update annotation on a request |
| POST | `/api/tools/traffic-inspector/requests/{id}/replay` | none-detected |  | Replay a captured request through OmniRoute router |
| GET | `/api/tools/traffic-inspector/requests/{id}` | none-detected |  | Get a single intercepted request by ID |
| GET | `/api/tools/traffic-inspector/requests` | none-detected |  | List intercepted requests (filterable) |
| DELETE | `/api/tools/traffic-inspector/requests` | none-detected |  | Clear the in-memory traffic buffer |
| GET | `/api/tools/traffic-inspector/sessions/{id}/export.har` | none-detected |  | Export a recorded session as HAR 1.2 |
| POST | `/api/tools/traffic-inspector/sessions/{id}/requests` | none-detected |  | POST tools › traffic inspector › sessions › <id> › requests |
| GET | `/api/tools/traffic-inspector/sessions/{id}` | none-detected |  | Get session snapshot (all captured requests) |
| PATCH | `/api/tools/traffic-inspector/sessions/{id}` | none-detected |  | Stop or rename a recording session |
| DELETE | `/api/tools/traffic-inspector/sessions/{id}` | none-detected |  | Delete a recording session |
| GET | `/api/tools/traffic-inspector/sessions` | none-detected |  | List all saved recording sessions |
| POST | `/api/tools/traffic-inspector/sessions` | none-detected |  | Start a new recording session |
| GET | `/api/tools/traffic-inspector/ws` | none-detected |  | Live WebSocket stream of intercepted requests |
| POST | `/api/translator/detect` | none-detected |  | Detect request format |
| GET | `/api/translator/history` | none-detected |  | Get translation history |
| POST | `/api/translator/send` | none-detected | yes | Send translated request to provider |
| POST | `/api/translator/transform-stream` | none-detected |  | POST translator › transform stream |
| POST | `/api/translator/translate` | none-detected |  | Translate between formats |
| GET | `/api/tunnels/cloudflared` | isAuthenticated |  | GET tunnels › cloudflared |
| POST | `/api/tunnels/cloudflared` | isAuthenticated |  | POST tunnels › cloudflared |
| GET | `/api/tunnels/ngrok` | isAuthenticated |  | GET tunnels › ngrok |
| POST | `/api/tunnels/ngrok` | isAuthenticated |  | POST tunnels › ngrok |
| GET | `/api/tunnels/tailscale/check` | requireTailscaleAuth |  | GET tunnels › tailscale › check |
| POST | `/api/tunnels/tailscale/disable` | requireTailscaleAuth |  | POST tunnels › tailscale › disable |
| POST | `/api/tunnels/tailscale/enable` | requireTailscaleAuth |  | POST tunnels › tailscale › enable |
| POST | `/api/tunnels/tailscale/install` | requireTailscaleAuth | yes | POST tunnels › tailscale › install |
| POST | `/api/tunnels/tailscale/login` | requireTailscaleAuth |  | POST tunnels › tailscale › login |
| GET | `/api/tunnels/tailscale` | requireTailscaleAuth |  | GET tunnels › tailscale |
| POST | `/api/tunnels/tailscale/start-daemon` | requireTailscaleAuth |  | POST tunnels › tailscale › start daemon |
| GET | `/api/upstream-proxy/{providerId}` | none-detected |  | GET upstream proxy › <providerId> |
| PUT | `/api/upstream-proxy/{providerId}` | none-detected |  | PUT upstream proxy › <providerId> |
| DELETE | `/api/upstream-proxy/{providerId}` | none-detected |  | DELETE upstream proxy › <providerId> |
| GET | `/api/usage/{connectionId}` | none-detected |  | Get usage for a specific connection |
| GET | `/api/usage/analytics` | requireManagementAuth |  | Get usage analytics |
| GET | `/api/usage/availability` | none-detected |  |  |
| GET | `/api/usage/budget/bulk` | requireManagementAuth |  | GET usage › budget › bulk |
| GET | `/api/usage/budget` | requireManagementAuth |  | Get usage budget status |
| POST | `/api/usage/budget` | requireManagementAuth |  | Configure usage budget |
| GET | `/api/usage/by-run` | requireManagementAuth |  |  |
| GET | `/api/usage/cache-health` | none-detected |  | Get prompt-cache health summary |
| GET | `/api/usage/call-logs/{id}` | requireManagementAuth |  | Get a specific call log |
| GET | `/api/usage/call-logs/filters` | requireManagementAuth |  | Get call log filter options |
| GET | `/api/usage/call-logs` | requireManagementAuth |  | Get call logs |
| GET | `/api/usage/codex-reset-credit` | requireManagementAuth |  | GET usage › codex reset credit |
| POST | `/api/usage/codex-reset-credit` | requireManagementAuth |  | POST usage › codex reset credit |
| GET | `/api/usage/combo-forecast` | requireManagementAuth |  | GET usage › combo forecast |
| GET | `/api/usage/combo-health-autopilot` | requireManagementAuth |  | GET usage › combo health autopilot |
| GET | `/api/usage/combo-health-dashboard` | requireManagementAuth |  | GET usage › combo health dashboard |
| GET | `/api/usage/combo-health` | none-detected |  | GET usage › combo health |
| GET | `/api/usage/combo-scoring-inspector` | requireManagementAuth |  | GET usage › combo scoring inspector |
| GET | `/api/usage/combo-trace/{id}` | requireManagementAuth |  | GET usage › combo trace › <id> |
| GET | `/api/usage/glm-reset-card` | requireManagementAuth |  |  |
| POST | `/api/usage/glm-reset-card` | requireManagementAuth |  |  |
| GET | `/api/usage/history` | requireManagementAuth |  | Get usage history |
| GET | `/api/usage/key-quota` | requireManagementAuth |  |  |
| POST | `/api/usage/key-quota` | requireManagementAuth |  |  |
| DELETE | `/api/usage/key-quota` | requireManagementAuth |  |  |
| GET | `/api/usage/local-summary` | requireManagementAuth |  |  |
| GET | `/api/usage/logs` | requireManagementAuth |  | Get usage logs |
| GET | `/api/usage/model-latency-stats` | requireManagementAuth |  | Get per-model/provider latency statistics |
| GET | `/api/usage/om-usage` | none-detected |  | GET usage › om usage |
| GET | `/api/usage/provider-limits` | none-detected |  | GET usage › provider limits |
| POST | `/api/usage/provider-limits` | none-detected |  | POST usage › provider limits |
| GET | `/api/usage/provider-window-costs` | requireManagementAuth |  | GET usage › provider window costs |
| GET | `/api/usage/proxy-logs` | none-detected |  | Get proxy logs |
| DELETE | `/api/usage/proxy-logs` | none-detected |  |  |
| GET | `/api/usage/quota` | none-detected |  | GET usage › quota |
| GET | `/api/usage/request-logs` | requireManagementAuth |  | Get request logs |
| GET | `/api/usage/requests-by-provider-date` | requireManagementAuth |  | GET usage › requests by provider date |
| GET | `/api/usage/route-explain/{id}` | requireManagementAuth |  | GET usage › route explain › <id> |
| GET | `/api/usage/token-limits` | none-detected |  | GET usage › token limits |
| POST | `/api/usage/token-limits` | none-detected |  | POST usage › token limits |
| DELETE | `/api/usage/token-limits` | none-detected |  | DELETE usage › token limits |
| GET | `/api/usage/utilization` | none-detected |  | GET usage › utilization |
| POST | `/api/v0/management/api-call` | requireCliProxyManagementAuth |  | CLIProxyAPI-compatible upstream usage call |
| GET | `/api/v0/management/auth-files` | requireCliProxyManagementAuth |  | CLIProxyAPI-compatible OAuth account list |
| POST | `/api/v0/management/reset-quota` | requireCliProxyManagementAuth |  | CLIProxyAPI-compatible cooldown reset |
| GET | `/api/v1/{...omnirouteCatchAll}` | none-detected |  |  |
| POST | `/api/v1/{...omnirouteCatchAll}` | none-detected |  |  |
| PUT | `/api/v1/{...omnirouteCatchAll}` | none-detected |  |  |
| PATCH | `/api/v1/{...omnirouteCatchAll}` | none-detected |  |  |
| DELETE | `/api/v1/{...omnirouteCatchAll}` | none-detected |  |  |
| GET | `/api/v1/accounts/{id}/limits` | requireManagementAuth |  | GET accounts › <id> › limits |
| PUT | `/api/v1/accounts/{id}/limits` | requireManagementAuth |  | PUT accounts › <id> › limits |
| GET | `/api/v1/agents/credentials` | requireCloudAgentManagementAuth |  | GET agents › credentials |
| POST | `/api/v1/agents/credentials` | requireCloudAgentManagementAuth |  | POST agents › credentials |
| GET | `/api/v1/agents/health` | requireCloudAgentManagementAuth |  | GET agents › health |
| GET | `/api/v1/agents/tasks/{id}` | requireCloudAgentManagementAuth |  | GET agents › tasks › <id> |
| POST | `/api/v1/agents/tasks/{id}` | requireCloudAgentManagementAuth |  | POST agents › tasks › <id> |
| DELETE | `/api/v1/agents/tasks/{id}` | requireCloudAgentManagementAuth |  | DELETE agents › tasks › <id> |
| GET | `/api/v1/agents/tasks` | requireCloudAgentManagementAuth |  | GET agents › tasks |
| POST | `/api/v1/agents/tasks` | requireCloudAgentManagementAuth |  | POST agents › tasks |
| DELETE | `/api/v1/agents/tasks` | requireCloudAgentManagementAuth |  | DELETE agents › tasks |
| POST | `/api/v1/alpha/search` | none-detected |  |  |
| POST | `/api/v1/antigravity` | none-detected |  | POST antigravity |
| POST | `/api/v1/api/chat` | none-detected |  | Ollama-compatible chat endpoint |
| POST | `/api/v1/audio/speech` | none-detected |  | Generate speech audio |
| POST | `/api/v1/audio/transcriptions` | none-detected |  | Transcribe audio |
| POST | `/api/v1/audio/translations` | none-detected |  | Translate audio to English |
| GET | `/api/v1/auto-combo/{channel}/candidates` | none-detected |  | GET auto combo › <channel> › candidates |
| POST | `/api/v1/batches/{id}/cancel` | none-detected |  | POST batches › <id> › cancel |
| GET | `/api/v1/batches/{id}` | none-detected |  | GET batches › <id> |
| DELETE | `/api/v1/batches/{id}` | none-detected |  | DELETE batches › <id> |
| DELETE | `/api/v1/batches/delete-completed` | none-detected |  | DELETE batches › delete completed |
| GET | `/api/v1/batches` | none-detected |  | GET batches |
| POST | `/api/v1/batches` | none-detected |  | POST batches |
| POST | `/api/v1/chat/completions` | none-detected |  | Create chat completion |
| POST | `/api/v1/classify` | none-detected |  | POST classify |
| GET | `/api/v1/combos` | none-detected |  | GET combos |
| POST | `/api/v1/completions` | none-detected |  | POST completions |
| GET | `/api/v1/embeddings` | none-detected |  |  |
| POST | `/api/v1/embeddings` | none-detected |  | Create embeddings |
| GET | `/api/v1/explain/routing` | none-detected |  | Routing explainability snapshot |
| GET | `/api/v1/fal/jobs/{id}` | none-detected |  | Poll a saved Fal job or retrieve its result without resubmission |
| POST | `/api/v1/fal/jobs/{id}` | none-detected |  | Send one authorized invocation to an active Fal realtime or HTTP WebSocket |
| DELETE | `/api/v1/fal/jobs/{id}` | none-detected |  | Cancel a saved Fal job or close its realtime session |
| GET | `/api/v1/fal/models` | none-detected |  | Discover Fal endpoints or load one endpoint's validated schema |
| POST | `/api/v1/fal/run` | none-detected |  | Execute validated native Fal model inputs |
| GET | `/api/v1/files/{id}/content` | none-detected |  | GET files › <id> › content |
| GET | `/api/v1/files/{id}` | none-detected |  | GET files › <id> |
| DELETE | `/api/v1/files/{id}` | none-detected |  | DELETE files › <id> |
| GET | `/api/v1/files` | none-detected |  | GET files |
| POST | `/api/v1/files` | none-detected |  | POST files |
| POST | `/api/v1/images/edits` | none-detected |  | POST images › edits |
| GET | `/api/v1/images/generations` | none-detected |  |  |
| POST | `/api/v1/images/generations` | none-detected |  | Generate images |
| GET | `/api/v1/images/upscale` | none-detected |  | GET images › upscale |
| POST | `/api/v1/images/upscale` | none-detected |  | POST images › upscale |
| POST | `/api/v1/issues/report` | requireManagementAuth |  | POST issues › report |
| GET | `/api/v1/management/proxies/assignments` | requireManagementAuth |  | GET management › proxies › assignments |
| PUT | `/api/v1/management/proxies/assignments` | requireManagementAuth |  | PUT management › proxies › assignments |
| PUT | `/api/v1/management/proxies/bulk-assign` | none-detected |  | PUT management › proxies › bulk assign |
| GET | `/api/v1/management/proxies/health` | none-detected |  | GET management › proxies › health |
| GET | `/api/v1/management/proxies` | requireManagementAuth |  | GET management › proxies |
| POST | `/api/v1/management/proxies` | requireManagementAuth |  | POST management › proxies |
| PATCH | `/api/v1/management/proxies` | requireManagementAuth |  | PATCH management › proxies |
| DELETE | `/api/v1/management/proxies` | requireManagementAuth |  | DELETE management › proxies |
| GET | `/api/v1/management/proxy-subscriptions/{id}/nodes` | requireManagementAuth |  | Get a subscription's last-parsed node summary |
| POST | `/api/v1/management/proxy-subscriptions/{id}/refresh` | requireManagementAuth |  | Refresh a proxy subscription |
| GET | `/api/v1/management/proxy-subscriptions/{id}` | requireManagementAuth |  | Get a proxy subscription |
| PATCH | `/api/v1/management/proxy-subscriptions/{id}` | requireManagementAuth |  | Update a proxy subscription |
| DELETE | `/api/v1/management/proxy-subscriptions/{id}` | requireManagementAuth |  | Delete a proxy subscription |
| GET | `/api/v1/management/proxy-subscriptions` | requireManagementAuth |  | List proxy subscriptions |
| POST | `/api/v1/management/proxy-subscriptions` | requireManagementAuth |  | Create a proxy subscription |
| GET | `/api/v1/me/sessions/{id}` | none-detected |  | GET me › sessions › <id> |
| GET | `/api/v1/me/sessions` | none-detected |  | GET me › sessions |
| GET | `/api/v1/me/status` | none-detected |  | GET me › status |
| GET | `/api/v1/media/{id}` | none-detected |  | GET media › <id> |
| POST | `/api/v1/messages/count_tokens` | none-detected |  | Count tokens for a message |
| POST | `/api/v1/messages` | none-detected |  | Create message (Anthropic-compatible) |
| GET | `/api/v1/models/{...model}` | none-detected |  |  |
| GET | `/api/v1/models/health` | none-detected |  | Per-model pause state for the caller's key |
| GET | `/api/v1/models/query` | none-detected |  |  |
| POST | `/api/v1/models/query` | none-detected |  | Query a model shortlist |
| GET | `/api/v1/models` | none-detected |  | List available models |
| POST | `/api/v1/moderations` | none-detected |  | Create moderation |
| GET | `/api/v1/multimodal-embeddings` | none-detected |  | List embedding models (Jina multimodal-embeddings alias) |
| POST | `/api/v1/multimodal-embeddings` | none-detected |  | Create embeddings (Jina multimodal-embeddings alias) |
| GET | `/api/v1/muse-code/models` | none-detected |  | GET muse code › models |
| POST | `/api/v1/music/detailed` | none-detected |  | Compose ElevenLabs music with its composition plan |
| POST | `/api/v1/music/detailed/stream` | none-detected |  | Stream ElevenLabs music and metadata as SSE |
| GET | `/api/v1/music/generations` | none-detected |  | GET music › generations |
| POST | `/api/v1/music/generations` | none-detected |  | POST music › generations |
| POST | `/api/v1/music/plan` | none-detected |  | Create an ElevenLabs music composition plan |
| POST | `/api/v1/music` | none-detected |  | Compose ElevenLabs music |
| POST | `/api/v1/music/stream` | none-detected |  | Stream ElevenLabs music |
| POST | `/api/v1/ocr` | none-detected |  | Document OCR |
| GET | `/api/v1/provider-plugin-manifest` | none-detected |  | Provider plugin manifest |
| POST | `/api/v1/providers/{provider}/chat/completions` | none-detected |  | Create chat completion (provider-specific) |
| POST | `/api/v1/providers/{provider}/embeddings` | none-detected |  | Create embeddings (provider-specific) |
| POST | `/api/v1/providers/{provider}/images/generations` | none-detected |  | Generate images (provider-specific) |
| GET | `/api/v1/providers/{provider}/limits` | requireManagementAuth |  | GET providers › <provider> › limits |
| PUT | `/api/v1/providers/{provider}/limits` | requireManagementAuth |  | PUT providers › <provider> › limits |
| GET | `/api/v1/providers/{provider}/models` | none-detected |  | List models for a specific provider |
| GET | `/api/v1/providers/{provider}/voices/{voiceId}` | none-detected |  |  |
| PATCH | `/api/v1/providers/{provider}/voices/{voiceId}` | none-detected |  |  |
| DELETE | `/api/v1/providers/{provider}/voices/{voiceId}` | none-detected |  |  |
| GET | `/api/v1/providers/{provider}/voices` | none-detected |  |  |
| POST | `/api/v1/providers/{provider}/voices` | none-detected |  |  |
| GET | `/api/v1/providers/suggested-models` | isAuthenticated |  | Suggested media models |
| GET | `/api/v1/quota-recoveries/{id}` | none-detected |  | Poll a quota recovery ticket |
| DELETE | `/api/v1/quota-recoveries/{id}` | none-detected |  | Cancel a quota recovery ticket |
| GET | `/api/v1/quotas/check` | isAuthenticated |  | GET quotas › check |
| POST | `/api/v1/registered-keys/{id}/revoke` | requireManagementAuth |  | POST registered keys › <id> › revoke |
| GET | `/api/v1/registered-keys/{id}` | requireManagementAuth |  | GET registered keys › <id> |
| DELETE | `/api/v1/registered-keys/{id}` | requireManagementAuth |  | DELETE registered keys › <id> |
| GET | `/api/v1/registered-keys` | requireManagementAuth+isAuthenticated |  | GET registered keys |
| POST | `/api/v1/registered-keys` | requireManagementAuth+isAuthenticated |  | POST registered keys |
| POST | `/api/v1/relay/chat/completions/bifrost` | none-detected | yes | POST relay › chat › completions › bifrost |
| POST | `/api/v1/relay/chat/completions` | none-detected | yes | POST relay › chat › completions |
| POST | `/api/v1/rerank` | none-detected |  | Rerank documents |
| POST | `/api/v1/responses/{...path}` | none-detected |  |  |
| POST | `/api/v1/responses/input_tokens` | none-detected |  |  |
| POST | `/api/v1/responses` | none-detected |  | Create response (OpenAI Responses API) |
| GET | `/api/v1` | none-detected |  | API v1 root endpoint |
| GET | `/api/v1/search/analytics` | none-detected |  | GET search › analytics |
| GET | `/api/v1/search` | none-detected |  | List search providers |
| POST | `/api/v1/search` | none-detected |  | Run a unified search |
| POST | `/api/v1/segment` | none-detected |  | POST segment |
| POST | `/api/v1/session-leases` | none-detected |  | Acquire, inspect, renew, or release an exclusive managed connection lease |
| POST | `/api/v1/sound-generation` | none-detected |  | Create an ElevenLabs sound effect |
| POST | `/api/v1/speech-to-text` | none-detected |  | ElevenLabs speech-to-text |
| GET | `/api/v1/systemone` | none-detected |  | List decisions-capable models |
| POST | `/api/v1/systemone` | none-detected |  | System One typed decisions |
| POST | `/api/v1/text-to-speech/{voiceId}` | none-detected |  | ElevenLabs text-to-speech |
| GET | `/api/v1/video-bridge/drilldown` | none-detected |  | Read authenticated tenant-bound video frame variants |
| DELETE | `/api/v1/video-bridge/drilldown` | none-detected |  | Delete an authenticated owner's video drill-down handle |
| GET | `/api/v1/videos/generations` | none-detected |  | GET videos › generations |
| POST | `/api/v1/videos/generations` | none-detected |  | POST videos › generations |
| GET | `/api/v1/voices` | none-detected |  | List ElevenLabs voices |
| POST | `/api/v1/vscode/{token}/api/chat` | none-detected |  | POST vscode › <token> › api › chat |
| POST | `/api/v1/vscode/{token}/api/show` | none-detected |  | POST vscode › <token> › api › show |
| GET | `/api/v1/vscode/{token}/api/tags` | none-detected |  | GET vscode › <token> › api › tags |
| GET | `/api/v1/vscode/{token}/api/version` | none-detected |  | GET vscode › <token> › api › version |
| POST | `/api/v1/vscode/{token}/chat/completions` | none-detected |  | POST vscode › <token> › chat › completions |
| GET | `/api/v1/vscode/{token}/combos` | none-detected |  | GET vscode › <token> › combos |
| GET | `/api/v1/vscode/{token}/models` | none-detected |  | GET vscode › <token> › models |
| POST | `/api/v1/vscode/{token}/responses` | none-detected |  | POST vscode › <token> › responses |
| GET | `/api/v1/vscode/{token}` | none-detected |  | GET vscode › <token> |
| POST | `/api/v1/vscode/{token}/v1/chat/completions` | none-detected |  | POST vscode › <token> › v1 › chat › completions |
| GET | `/api/v1/vscode/{token}/v1/models` | none-detected |  | GET vscode › <token> › v1 › models |
| GET | `/api/v1/vscode/combos/{token}/{...slug}` | none-detected |  |  |
| POST | `/api/v1/vscode/combos/{token}/{...slug}` | none-detected |  |  |
| POST | `/api/v1/vscode/raw/{token}/api/chat` | none-detected |  | POST vscode › raw › <token> › api › chat |
| POST | `/api/v1/vscode/raw/{token}/api/show` | none-detected |  | POST vscode › raw › <token> › api › show |
| GET | `/api/v1/vscode/raw/{token}/api/tags` | none-detected |  | GET vscode › raw › <token> › api › tags |
| GET | `/api/v1/vscode/raw/{token}/api/version` | none-detected |  | GET vscode › raw › <token> › api › version |
| POST | `/api/v1/vscode/raw/{token}/chat/completions` | none-detected |  | POST vscode › raw › <token> › chat › completions |
| GET | `/api/v1/vscode/raw/{token}/combos` | none-detected |  | GET vscode › raw › <token> › combos |
| GET | `/api/v1/vscode/raw/{token}/models` | none-detected |  | GET vscode › raw › <token> › models |
| POST | `/api/v1/vscode/raw/{token}/responses` | none-detected |  | POST vscode › raw › <token> › responses |
| GET | `/api/v1/vscode/raw/{token}` | none-detected |  | GET vscode › raw › <token> |
| POST | `/api/v1/vscode/raw/{token}/v1/chat/completions` | none-detected |  | POST vscode › raw › <token> › v1 › chat › completions |
| GET | `/api/v1/vscode/raw/{token}/v1/models` | none-detected |  | GET vscode › raw › <token> › v1 › models |
| POST | `/api/v1/web/fetch` | none-detected |  | POST web › fetch |
| POST | `/api/v1/web/map` | none-detected |  |  |
| GET | `/api/v1/ws` | none-detected |  | Chat completion over WebSocket (handshake + upgrade) |
| POST | `/api/v1beta/models/{...path}` | none-detected |  |  |
| GET | `/api/v1beta/models` | none-detected |  | List models (Gemini format) |
| GET | `/api/version-manager/check-update` | requireManagementAuth |  | GET version manager › check update |
| POST | `/api/version-manager/install` | requireManagementAuth |  | POST version manager › install |
| POST | `/api/version-manager/restart` | none-detected |  | POST version manager › restart |
| POST | `/api/version-manager/start` | none-detected |  | POST version manager › start |
| GET | `/api/version-manager/status` | requireManagementAuth |  | GET version manager › status |
| POST | `/api/version-manager/stop` | none-detected |  | POST version manager › stop |
| GET | `/api/vnc-session/{...params}` | requireManagementAuth |  |  |
| POST | `/api/vnc-session/{...params}` | requireManagementAuth |  |  |
| DELETE | `/api/vnc-session/{...params}` | requireManagementAuth |  |  |
| GET | `/api/vnc-session` | requireManagementAuth |  | GET vnc session |
| GET | `/api/webhooks/{id}/deliveries` | requireManagementAuth |  | GET webhooks › <id> › deliveries |
| GET | `/api/webhooks/{id}` | requireManagementAuth |  | GET webhooks › <id> |
| PUT | `/api/webhooks/{id}` | requireManagementAuth |  | PUT webhooks › <id> |
| DELETE | `/api/webhooks/{id}` | requireManagementAuth |  | DELETE webhooks › <id> |
| POST | `/api/webhooks/{id}/test` | requireManagementAuth |  | POST webhooks › <id> › test |
| GET | `/api/webhooks` | requireManagementAuth |  | GET webhooks |
| POST | `/api/webhooks` | requireManagementAuth |  | POST webhooks |
| POST | `/api/webhooks/validate-url` | requireManagementAuth |  | POST webhooks › validate url |
