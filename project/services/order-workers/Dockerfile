FROM node:24-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY services/order-workers/package.json ./services/order-workers/
COPY shared/api-client/package.json ./shared/api-client/
COPY shared/cache-contracts/package.json ./shared/cache-contracts/
COPY shared/db/package.json ./shared/db/
COPY shared/logger/package.json ./shared/logger/
COPY shared/order-contracts/package.json ./shared/order-contracts/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm --filter @services/order-workers... build
RUN pnpm prune --prod --ignore-scripts

FROM node:24-alpine AS runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
WORKDIR /repo

COPY --from=builder /repo/package.json ./package.json
COPY --from=builder /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/services/order-workers ./services/order-workers
COPY --from=builder /repo/shared ./shared

USER appuser

CMD ["node", "services/order-workers/dist/index.js"]
