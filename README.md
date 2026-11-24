# Deploy and Host Node-RED with Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/node-red-50-low-code-automation-login-pe?referralCode=20H68q)

Node-RED is a low-code programming tool for wiring together APIs, devices and online services in a browser-based flow editor. This template runs Node-RED 5.0 with an admin login that is always on, a persistent volume for flows, credentials and installed nodes, and safe defaults for a public URL.

## About Hosting Node-RED

Node-RED is a Node.js application: the editor and the flow runtime run in one process, and everything you build is stored in its user directory (`/data`): `flows.json`, encrypted credentials, context data and the nodes you install from the palette. On Railway that directory is a volume, so flows and installed nodes survive restarts and redeploys.

A fresh Node-RED has no editor login, which is dangerous on a public URL: anyone could run code on the server. This template always enables `adminAuth`: the start script turns `NODE_RED_USERNAME` and a generated `NODE_RED_PASSWORD` into a bcrypt hash at every start. Credentials in flows are encrypted with a generated `NODE_RED_CREDENTIAL_SECRET`. Projects (git integration) are off by default.

## Common Use Cases

- Automate webhooks, APIs and SaaS tools without writing a full backend
- Collect and process IoT data over MQTT, HTTP or WebSockets
- Build scheduled jobs, alerting and small integrations between internal systems
- Prototype HTTP APIs and dashboards with community nodes

## Dependencies for Node-RED Hosting

- Node-RED 5.0.10 (`nodered/node-red`, Node.js 24, pinned by digest)
- A Railway volume for `/data`

### Deployment Dependencies

- Node-RED: https://nodered.org
- Documentation: https://nodered.org/docs
- Securing Node-RED: https://nodered.org/docs/user-guide/runtime/securing-node-red
- Docker image: https://github.com/node-red/node-red-docker

### Implementation Details

| Service | What it does | Public |
|---|---|---|
| Node-RED | Flow editor, admin API and flow runtime (port 1880), volume `/data` | yes |

**First login**

1. Open the Node-RED public URL.
2. Sign in with `NODE_RED_USERNAME` (default `admin`) and the generated `NODE_RED_PASSWORD` from the service's Variables tab.

**Changing the password.** Set a new `NODE_RED_PASSWORD` (8-128 characters) and redeploy; the hash is regenerated at every start. A shorter or empty value never stops the deploy: the editor stays locked with a random password and the log says how to fix it.

**HTTP endpoints.** Flows with HTTP-in nodes serve at `https://{your-domain}/{path}` without the editor login, as in standard Node-RED (useful for webhooks). Set `NODE_RED_HTTP_NODE_AUTH=true` to protect them, and dashboards, with the same login.

**Credentials.** `NODE_RED_CREDENTIAL_SECRET` encrypts passwords and tokens stored in nodes. Keep it: if it changes, stored credentials cannot be read anymore.

**Installing nodes.** Use Manage palette in the editor; nodes are installed into `/data/node_modules` on the volume.

**Persistent context.** The default context store is in memory (upstream default). Use the `file` store, for example `flow.set("count", 1, "file")`, for values that must survive restarts.

**Projects.** Set `NODE_RED_ENABLE_PROJECTS=true` to version flows in git from the editor.

**Scaling.** Node-RED keeps state on its volume and runs as a single replica; give it more RAM for large flows.

**Versions.** The image is pinned in `services/node-red/Dockerfile` (`NODE_RED_IMAGE`, tag and digest). To upgrade, use a newer release tag and digest and redeploy; read the release notes for breaking changes between major versions.

**Resources.** Measured: about 0.07-0.16 GB RAM idle with a small flow. Runs on Trial, Hobby and Pro.

### Why Deploy Node-RED on Railway?

Railway runs Node-RED with HTTPS, a persistent volume and a generated admin password from one template, so your automation editor is online and protected in minutes, and you pay only for what it uses.
