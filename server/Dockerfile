# ─────────────────────────────────────────────────────────────────────────────
# Build context: REPO ROOT  (not server/)
#
# This Dockerfile is built with the repository root as the Docker build context
# so that it can access the root yarn.lock (required for yarn workspaces).
# sst.config.ts passes:
#   image: { context: ".", dockerfile: "server/Dockerfile" }
#
# Stage 1 (builder) — install all workspace deps, compile TypeScript to ESM.
# Stage 2 (runner)  — copy compiled dist + node_modules, run the server.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for better layer caching.
# Yarn v1 workspaces need the root yarn.lock + every workspace package.json, or
# `yarn install --frozen-lockfile` fails (lockfile was generated for client + server).
COPY package.json yarn.lock ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
# client postinstall runs patch-package; patches must exist or install fails.
COPY client/patches ./client/patches

# Root `prepare` runs husky — not applicable in Docker (no .git); skip it.
ENV HUSKY=0

# Install all workspace dependencies (dev + prod) using the root lockfile.
RUN yarn install --frozen-lockfile

# Copy server source (after dependency install to maximise cache hits).
COPY server/ ./server/

# Compile TypeScript → ESM (use workspace tsup + typescript; avoid `npx tsup` which
# downloads a separate tsup without access to hoisted typescript).
WORKDIR /app
RUN yarn workspace npo-server-template run bundle

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the compiled server output.
COPY --from=builder /app/server/dist ./dist

# Copy node_modules from the builder stage.
# Yarn v1 hoists workspace dependencies to the root node_modules/, so we copy
# the whole directory rather than trying to cherry-pick server-only packages.
COPY --from=builder /app/node_modules ./node_modules

# package.json is needed for Node.js ESM module resolution ("type": "module").
COPY server/package.json ./package.json

# Port must match PROD_SERVER_PORT and the forward rule in sst.config.ts.
EXPOSE 3001

CMD ["node", "dist/server.js"]
