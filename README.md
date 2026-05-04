# Exam Flash Sales System

A simplified ecommerce system for a highly anticipated flash sale, where a limited-edition product becomes available for a fixed period and thousands of users may attempt to purchase it at the same time.

The system is designed to handle sudden traffic spikes gracefully, manage inventory accurately, enforce per-user purchase limits, and provide a reliable user experience under high-concurrency conditions. It demonstrates high throughput and scalability, robustness and fault tolerance, and concurrency control in a flash-sale workload.

## Infrastructure

- Frontend SPA - Browser-based storefront for product browsing, cart management, and checkout submission. It can be served from static hosting or a CDN and calls the main REST API backend.
- Main REST API backend - Fastify HTTP API for authentication, product browsing, cart validation, checkout requests, Redis reservation checks, and RabbitMQ event publishing. Multiple backend instances can run behind a load balancer to handle traffic spikes and scale the request path horizontally.
- Order workers - Background workers that consume order events from RabbitMQ and process reservation, submission, timeout, and failure compensation flows. Multiple worker replicas can run in parallel so RabbitMQ distributes work across consumers, allowing order processing capacity to scale horizontally.
- Postgresql (RDS) - Primary relational database for users, products, orders, payments, and stock records. It is used for durable transactional state because order creation and inventory updates need consistency and auditability.
- Redis (ElastiCache) - Low-latency cache and reservation store for flash-sale stock counters, per-user usage limits, promo usage limits, and temporary order tracking. It is used because atomic Lua scripts and in-memory counters let checkout handle high-concurrency reservation checks without putting every request directly on Postgresql.
- RabbitMQ (Amazon MQ) - Message broker for asynchronous order processing, delayed timeout handling, and failure compensation. It is used to keep checkout responsive, absorb traffic spikes, and let the order worker process database updates and rollbacks reliably outside the request path.

![System overview](docs/system%20overview.jpg)

## Checkout flow

See [Order Flow](docs/order-flow.md) for the checkout, queue, timeout, and compensation workflow.

## Frontend Checkout Flow

Users browse the product list, select a product card, and click Buy Now to start checkout. The frontend then asks the user to verify their email, select a payment method, and confirm checkout. After checkout is submitted, the backend validates the request, reserves stock, and creates an order for asynchronous processing.

The frontend waits for the asynchronous order process by polling `/api/orders/{orderId}/status`. It keeps waiting while the order status is `pending`, then either shows any processing error returned by the backend or continues once the status changes to a non-pending state.

When checkout processing succeeds, the user sees the payment form popup. After payment submission, the user is routed to the order page to track the order status.

## Setup

Expected local dependencies:

- Node.js 20.19 or newer
- pnpm 9.15.0, as pinned by `project/package.json`
- Docker with Docker Compose for local PostgreSQL, Redis, RabbitMQ, and stress-test observability stack

Run commands from the monorepo root:

1. Install dependencies

```sh
cd project
pnpm install
```

2. Create local environment files from the examples:

```sh
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
cp services/order-workers/.env.example services/order-workers/.env
cp shared/db/.env.example shared/db/.env
cp tools/stress-test/.env.example tools/stress-test/.env
```

The local environment expects these services to be available:

- PostgreSQL for the application database
- Redis for product stock, usage counters, reservation state, and temporary order tracking
- RabbitMQ for asynchronous order processing

3. You can start the required local services with Docker Compose:

```sh
docker compose -f ../infra/local/docker-compose.yml up -d
```

RabbitMQ management UI will be available at `http://localhost:15672`.

4. Initial build and code generation steps (only required on initial setup):

```sh
pnpm build:main
pnpm --filter @apps/backend run generate:spec
pnpm code-gen
pnpm build:frontend
```

5. Prepare the database:

```sh
pnpm --filter @shared/db run db:push
pnpm --filter @shared/db run seed
```

6. Run the main application pieces:

```sh
pnpm code-gen # or pnpm code-gen:watch for auto-regeneration on changes
pnpm dev
```

Alternatively, you can run each piece in a separate terminal for better visibility:

```sh
pnpm code-gen
pnpm --filter @apps/backend dev
pnpm --filter @apps/frontend dev
pnpm dev:shared
pnpm dev:services
```

7. All services should now be running. You can access the frontend at `http://localhost:5174`

Useful workspace commands:

```sh
pnpm build
pnpm lint
pnpm test:unit
pnpm test:integration
```

## Stress Testing

The repository includes k6 scenarios for exercising flash-sale behavior against the backend.

Run commands from the monorepo root (`project/`). Start local infra services, backend, and worker first.

1. First make sure the backend and worker are running, and local infra services are up (PostgreSQL, Redis, RabbitMQ). Ideally run backend and worker with PINO_LOG_LEVEL=error to reduce noise in the logs during stress tests.

2. Run with Docker (no local k6 install required):

```sh
pnpm --filter @tools/stress-test docker:up
```

3. Open observability dashboards:

```sh
# Grafana dashboard
http://localhost:3000

# Prometheus
http://localhost:9090
```

4. Run the flash-sale scenario:

```sh
pnpm --filter @tools/stress-test docker:flash-sale
```

5. Stop observability stack:

```sh
pnpm --filter @tools/stress-test docker:down
```

Stress-test environment variables:

```sh
API_BASE_URL=http://localhost:8000
STRESS_SCENARIO=flash-sale
STRESS_VUS=100
STRESS_REQUESTS=100
STRESS_MAX_DURATION=2m
STRESS_THINK_TIME_SECONDS=0
```

Notes:

- Docker runner default API base URL is `http://host.docker.internal:8000`.
- Default Grafana login is `admin` / `admin` (override with `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD`).

## Projects

- `project/apps/backend` - Fastify API for authentication, product browsing, cart validation, checkout, Redis reservations, and RabbitMQ event publishing.
- `project/apps/frontend` - Web client for users to browse products, manage the cart, and submit checkout requests.
- `project/services/order-workers` - Background worker that consumes order events from RabbitMQ and processes reservation, submission, timeout, and failure flows asynchronously.
- `project/shared/api-client` - Shared Hey API generated client and types based on the backend OpenAPI spec, intended for frontend and tooling consumers such as stress tests.
- `project/shared/db` - Shared database package containing Drizzle schema definitions, relations, enums, types, and database client setup.
- `project/shared/logger` - Shared Pino logger factory used by services and applications.
- `project/shared/order-contracts` - Shared order event names, message schemas, and queue-related constants.
- `project/shared/cache-contracts` - Shared Redis cache keys, reservation argument builders, and Lua scripts used for atomic stock and usage updates.
- `project/tools/stress-test` - k6 scenarios for exercising flash-sale behavior against the backend, along with Docker Compose setup for running tests with observability stack (Prometheus + Grafana).
