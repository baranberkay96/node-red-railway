# Node-RED 5.0.10 (Apache-2.0), official image unmodified (Node 24, Alpine), pinned by
# index digest, plus a Railway start script and settings file: admin login always on
# (bcrypt hash generated at start), projects off by default, volume /data owned by the
# node-red user. The start script runs as root only to chown the volume, then starts
# Node-RED as uid 1000.
ARG NODE_RED_IMAGE=nodered/node-red:5.0.10@sha256:3622786c15b6f57f61bf1d0ece59d06a18b742c5c8955f588d189b6bee8dc97d
FROM ${NODE_RED_IMAGE}

USER root
COPY --chmod=0644 railway-settings.js railway-node-red.js /usr/src/node-red/

ENV PORT=1880
ENTRYPOINT ["/usr/local/bin/node", "/usr/src/node-red/railway-node-red.js"]
