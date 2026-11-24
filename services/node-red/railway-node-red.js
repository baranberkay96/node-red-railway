/*
 * Railway start script for Node-RED (official image, unmodified).
 * Runs as root only to fix the Railway volume's ownership, then starts Node-RED as the
 * image's node-red user (uid 1000) with railway-settings.js:
 * - admin login always on: NODE_RED_USERNAME / NODE_RED_PASSWORD are turned into a bcrypt
 *   hash at every start (the plain password is not passed on to Node-RED or its flows);
 * - odd form values never stop the start (STANDARD 8.29): a bad user name becomes "admin",
 *   a missing or short password locks the editor with a random one and the log says how
 *   to fix it.
 * Secret values are never printed.
 */
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const { spawn, spawnSync } = require("node:child_process");

const APP = "/usr/src/node-red";
const DATA = "/data";
const UID = 1000;
const GID = 1000;
const log = (msg) => console.log(`[railway] ${msg}`);
const warn = (msg) => console.warn(`[railway] WARNING: ${msg}`);
const bcrypt = require(`${APP}/node_modules/bcryptjs`);

function adminUser() {
  const user = (process.env.NODE_RED_USERNAME || "").trim();
  if (/^[A-Za-z0-9._@-]{1,64}$/.test(user)) return user;
  if (user) warn("NODE_RED_USERNAME may only use letters, digits and . _ @ - (1-64 characters); using 'admin'");
  return "admin";
}

function adminHash() {
  const password = process.env.NODE_RED_PASSWORD || "";
  if (password.length >= 8 && password.length <= 128) return bcrypt.hashSync(password, 10);
  warn("NODE_RED_PASSWORD must be 8-128 characters. The editor stays locked with a random password nobody knows; set a valid NODE_RED_PASSWORD and redeploy.");
  return bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
}

function credentialSecret() {
  const secret = (process.env.NODE_RED_CREDENTIAL_SECRET || "").trim();
  if (!secret) {
    log("NODE_RED_CREDENTIAL_SECRET is empty: Node-RED uses the key it generated in /data/.config.runtime.json");
    return "";
  }
  if (secret.length < 16) warn("NODE_RED_CREDENTIAL_SECRET is shorter than 16 characters; consider a longer one (changing it later makes stored credentials unreadable)");
  return secret;
}

function fixVolumeOwnership() {
  try {
    fs.mkdirSync(DATA, { recursive: true });
    const stat = fs.statSync(DATA);
    if (stat.uid === UID && stat.gid === GID) return;
    const result = spawnSync("chown", ["-R", `${UID}:${GID}`, DATA], { stdio: "inherit" });
    if (result.status === 0) log("volume /data handed to the node-red user");
    else warn("could not chown /data; Node-RED may fail to save flows");
  } catch (error) {
    warn(`volume check failed: ${error.message}`);
  }
}

function port() {
  const value = (process.env.PORT || "").trim();
  const n = Number.parseInt(value, 10);
  if (Number.isInteger(n) && n >= 1 && n <= 65535 && String(n) === value) return value;
  if (value) warn(`PORT=${value} is not a valid port; using 1880`);
  return "1880";
}

function main() {
  const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
  if (isRoot) fixVolumeOwnership();
  const { NODE_RED_PASSWORD: _plain, ...env } = process.env;
  const user = adminUser();
  Object.assign(env, {
    HOME: APP,
    PORT: port(),
    NODE_RED_ADMIN_USER: user,
    NODE_RED_ADMIN_HASH: adminHash(),
    NODE_RED_CREDENTIAL_SECRET: credentialSecret(),
  });
  if ((process.env.NODE_RED_HTTP_NODE_AUTH || "").toLowerCase() === "true") {
    env.NODE_RED_HTTP_NODE_HASH = env.NODE_RED_ADMIN_HASH;
    log("HTTP-in endpoints and dashboards require the admin login (NODE_RED_HTTP_NODE_AUTH=true)");
  }
  // NODE_OPTIONS (if set) is read by Node from the environment.
  const args = [`${APP}/node_modules/node-red/red.js`, "--userDir", DATA, "--settings", `${APP}/railway-settings.js`];
  log(`starting Node-RED on [::]:${env.PORT} (editor login user '${user}', projects ${env.NODE_RED_ENABLE_PROJECTS === "true" ? "on" : "off"})`);
  const child = spawn(process.execPath, args, {
    cwd: APP,
    env,
    stdio: "inherit",
    ...(isRoot ? { uid: UID, gid: GID } : {}),
  });
  for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => child.kill(signal));
  child.on("exit", (code, signal) => process.exit(code === null ? (signal === "SIGTERM" ? 0 : 1) : code));
}

main();
