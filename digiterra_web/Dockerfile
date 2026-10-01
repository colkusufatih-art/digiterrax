# DIGITERRA website + client portal
FROM node:24-alpine
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
WORKDIR /app
COPY portal/package.json portal/package-lock.json portal/
RUN cd portal && npm ci --omit=dev && npm cache clean --force
COPY index.html ./
COPY assets ./assets
COPY datenschutzrichtlinie ./datenschutzrichtlinie
COPY nutzungsbedingungen ./nutzungsbedingungen
COPY impressum ./impressum
COPY portal ./portal
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "portal/src/server.js"]
