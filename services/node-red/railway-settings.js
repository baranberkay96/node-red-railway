/*
 * Node-RED settings for Railway (original file for this template; key names follow
 * Node-RED 5.0's documented settings.js). Values come from environment variables
 * prepared by railway-node-red.js. The editor and admin API always require a login.
 */
const env = process.env;

const settings = {
    flowFile: env.FLOWS || "flows.json",
    flowFilePretty: true,
    uiPort: Number(env.PORT) || 1880,
    // Node.js listens on IPv4 and IPv6 with "::" (Railway private and public networking).
    uiHost: "::",

    adminAuth: {
        type: "credentials",
        users: [{
            username: env.NODE_RED_ADMIN_USER || "admin",
            password: env.NODE_RED_ADMIN_HASH,
            permissions: "*",
        }],
    },

    diagnostics: { enabled: true, ui: true },
    runtimeState: { enabled: false, ui: false },
    telemetry: { enabled: env.NODE_RED_TELEMETRY === "true" },
    logging: {
        console: {
            level: env.NODE_RED_LOG_LEVEL || "info",
            metrics: false,
            audit: false,
        },
    },

    // "default" keeps context in memory (upstream default); use the "file" store
    // (context.set("key", value, "file")) for values that must survive restarts.
    contextStorage: {
        default: { module: "memory" },
        file: { module: "localfilesystem" },
    },

    exportGlobalContextKeys: false,
    externalModules: {},
    editorTheme: {
        page: { title: "Node-RED" },
        palette: {},
        projects: {
            // Off by default: projects need git credentials; turn on with NODE_RED_ENABLE_PROJECTS=true.
            enabled: env.NODE_RED_ENABLE_PROJECTS === "true",
            workflow: { mode: "manual" },
        },
        codeEditor: { lib: "monaco", options: {} },
        markdownEditor: { mermaid: { enabled: true } },
        multiplayer: { enabled: false },
    },
    functionExternalModules: true,
    globalFunctionTimeout: 0,
    functionTimeout: 0,
    functionGlobalContext: {},
    debugMaxLength: 1000,
    mqttReconnectTime: 15000,
    serialReconnectTime: 15000,
};

// Only pin the credential key when one is configured; otherwise Node-RED keeps its own
// generated key in /data/.config.runtime.json.
if (env.NODE_RED_CREDENTIAL_SECRET) {
    settings.credentialSecret = env.NODE_RED_CREDENTIAL_SECRET;
}

// Optional basic auth for HTTP-in endpoints and node-red-dashboard.
if (env.NODE_RED_HTTP_NODE_HASH) {
    settings.httpNodeAuth = { user: env.NODE_RED_ADMIN_USER || "admin", pass: env.NODE_RED_HTTP_NODE_HASH };
}

module.exports = settings;
