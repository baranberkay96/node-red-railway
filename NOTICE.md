# Notice

This package deploys **Node-RED** (https://github.com/node-red/node-red), Copyright OpenJS Foundation and other contributors, licensed under the **Apache License 2.0**. The image `nodered/node-red:5.0.10` (from https://github.com/node-red/node-red-docker, Apache-2.0) is used unmodified as the base.

What is used and how:

- `services/node-red/railway-settings.js` is original work for this template. Its option names and defaults follow Node-RED 5.0.10's documented `packages/node_modules/node-red/settings.js` (Apache-2.0).
- `services/node-red/railway-node-red.js` is original work; it uses the `bcryptjs` library shipped in the image (MIT) to hash the admin password, and starts `node-red/red.js` the same way as the image's `entrypoint.sh` (`--userDir /data`).
- Icon: Dashboard Icons (https://github.com/homarr-labs/dashboard-icons).

Market templates were read for comparison only; no files or text were copied. README and docs text are original.

This is a community template and is not affiliated with or endorsed by the OpenJS Foundation or the Node-RED project. Node-RED is a trademark of the OpenJS Foundation.
