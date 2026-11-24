# Node-RED 5.0 Low-Code Automation (Login, Persistent Volume): composer spec

Listing name: **Node-RED 5.0 Low-Code Automation (Login, Persistent Volume)**
Description (69 chars): Flow-based automation editor with admin login, saved flows and nodes.
Category: Automation. Icon: `https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/node-red.svg`
Repository: `baranberkay96/node-red-railway` (this folder is the repo root).

## Services

| Service | Source | Public | Volume | Healthcheck |
|---|---|---|---|---|
| Node-RED | repo `/services/node-red` (`FROM nodered/node-red:5.0.10@sha256:3622786c…c9d`, 2026-11-17, Node 24 Alpine) | domain → 1880 | `/data` | `/` (editor page), 300 s |

No required inputs.

## Start sequence (`railway-node-red.js`, runs as root, Node-RED as uid 1000)

1. `/data` not owned by 1000:1000 (fresh Railway volume) → `chown -R`.
2. `NODE_RED_USERNAME` not matching `[A-Za-z0-9._@-]{1,64}` → `admin`.
3. `NODE_RED_PASSWORD` 8-128 chars → bcrypt (10 rounds) into `NODE_RED_ADMIN_HASH`; else a random password's hash + log hint (editor locked, deploy succeeds). The plain password is removed from Node-RED's environment.
4. `NODE_RED_CREDENTIAL_SECRET` set → `credentialSecret`; empty → Node-RED's own generated key.
5. `NODE_RED_HTTP_NODE_AUTH=true` → `httpNodeAuth` with the same login.
6. Invalid `PORT` → 1880. Node-RED started with `--userDir /data --settings /usr/src/node-red/railway-settings.js`, `uiHost ::`; signals forwarded.

`railway-settings.js`: upstream 5.0 defaults plus `adminAuth` (always), projects from `NODE_RED_ENABLE_PROJECTS` (default off), telemetry off unless `NODE_RED_TELEMETRY=true`, context stores `default` (memory) + `file` (localfilesystem).

## Improvements over market templates

Market (2026-11): leader "Node-RED" 130 active builds a third-party repo with an unpinned base, healthcheck `/healthz` from custom code. "Node-Red" 11 active: third-party repo. "nodered" 29 active: `ADMIN_PASSWORD=password` hard-coded default.

- Official image 5.0.10 pinned by digest; no third-party code.
- Admin login always on, generated password, bcrypt at start, plain password not visible to flows; odd values never fail the deploy (STANDARD 8.29).
- Volume ownership fixed automatically; Node-RED does not run as root.
- Projects off by default, optional HTTP-node auth, persistent `file` context store, telemetry off.

## Resources

Measured on Railway 2026-11-24 (idle with a small HTTP flow):

| Service | RAM | CPU |
|---|---|---|
| Node-RED | 0.07-0.16 GB | ~0 |

≈ **$1-2/month** plus the volume. Prices: RAM $10/GB-month, vCPU $20/month, volume $0.15/GB-month. Minimum plan: Trial.

## Verification checklist

1. SUCCESS; `/` 200; log shows `starting Node-RED`, `Started flows`.
2. `GET /flows` without token → 401; `POST /auth/token` with the generated login → token; wrong password → 403.
3. Deploy a flow (inject → HTTP-in/response) through the admin API; HTTP endpoint answers.
4. Redeploy: flow still there (volume); credentials readable.
5. `NODE_RED_PASSWORD=abc` → SUCCESS with warning; login with `abc` refused.

Tested 2026-11-24 on Railway: all five. Log: `volume /data handed to the node-red user`, `Started flows`. Flow deployed via `POST /flows` (token from `/auth/token`), HTTP endpoint 200, `file` context counter survived two redeploys (n=1→3); a new valid password works after the locked boot.

## Open questions

- None known.
