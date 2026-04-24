# ViralObj Bridge — Express server exposing MCP tools to Gemini Enterprise
# Targets: Cloud Run, Railway, Fly.io, any container host listening on :8080

FROM node:18-slim

WORKDIR /app

# Install deps first for better layer cache. package-lock.json is committed.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# App source (webapp/, docs/, downloads/ are filtered out by .dockerignore)
COPY . .

# Run as non-root (node user ships with the official image, uid 1000)
RUN chown -R node:node /app
USER node

# Container runtime env — most hosts (Cloud Run, App Engine, Railway)
# inject PORT automatically; fall back to 8080 when running locally.
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Lightweight liveness probe hitting the public /health route.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
