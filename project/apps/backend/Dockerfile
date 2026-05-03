FROM node:24-alpine AS builder

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy manifests first for better layer caching — source changes won't bust the install layer
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY shared/api-client/package.json ./shared/api-client/
COPY shared/cache-contracts/package.json ./shared/cache-contracts/
COPY shared/db/package.json ./shared/db/
COPY shared/logger/package.json ./shared/logger/
COPY shared/order-contracts/package.json ./shared/order-contracts/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm --filter @apps/backend... build
RUN pnpm prune --prod --ignore-scripts

FROM node:24-alpine AS runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
WORKDIR /repo

COPY --from=builder /repo/package.json ./package.json
COPY --from=builder /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/backend ./apps/backend
COPY --from=builder /repo/shared ./shared

USER appuser

EXPOSE 8000

CMD ["node", "apps/backend/dist/server.js"]
