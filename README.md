# Exam Flash Sales System

A simplified ecommerce system for a highly anticipated flash sale, where a limited-edition product becomes available for a fixed period and thousands of users may attempt to purchase it at the same time.

The system is designed to handle sudden traffic spikes gracefully, manage inventory accurately, enforce per-user purchase limits, and provide a reliable user experience under high-concurrency conditions. It demonstrates high throughput and scalability, robustness and fault tolerance, and concurrency control in a flash-sale workload.

See [Order Flow](docs/order-flow.md) for the checkout, queue, timeout, and compensation workflow.

## Infrastructure

- PostgreSQL - Primary relational database for users, products, orders, payments, and stock records. It is used for durable transactional state because order creation and inventory updates need consistency and auditability.
- Redis - Low-latency cache and reservation store for flash-sale stock counters, per-user usage limits, promo usage limits, and temporary order tracking. It is used because atomic Lua scripts and in-memory counters let checkout handle high-concurrency reservation checks without putting every request directly on PostgreSQL.
- RabbitMQ - Message broker for asynchronous order processing, delayed timeout handling, and failure compensation. It is used to keep checkout responsive, absorb traffic spikes, and let the order worker process database updates and rollbacks reliably outside the request path.

![System overview](docs/system%20overview.jpg)

Create local environment files from the examples:

```sh
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
cp services/order-workers/.env.example services/order-workers/.env
cp shared/db/.env.example shared/db/.env
```

## Setup

Run commands from the monorepo root:

```sh
cd project
pnpm install
```

The local environment expects these services to be available:

- PostgreSQL for the application database
- Redis for product stock, usage counters, reservation state, and temporary order tracking
- RabbitMQ for asynchronous order processing

You can start the required local services with Docker Compose:

```sh
docker compose -f ../infra/local/docker-compose.yml up -d
```

RabbitMQ management UI will be available at `http://localhost:15672`.

Required backend environment variables:

```sh
PORT=8000
DATABASE_URL=postgresql://postgres@localhost:5434/exam-flash-sales-system
CACHE_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_ACCESS_SECRET=local-secret
COOKIE_SECRET=secret
```

Prepare the database:

```sh
pnpm --filter @shared/db db:push
pnpm --filter @shared/db seed
```

Run the main application pieces:

```sh
pnpm --filter @apps/backend dev
pnpm --filter @apps/frontend dev
pnpm --filter @services/order-workers dev
```

Useful workspace commands:

```sh
pnpm build
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm test:stress
```

## Projects

- `project/apps/backend` - Fastify API for authentication, product browsing, cart validation, checkout, Redis reservations, and RabbitMQ event publishing.
- `project/apps/frontend` - Web client for users to browse products, manage the cart, and submit checkout requests.
- `project/services/order-workers` - Background worker that consumes order events from RabbitMQ and processes reservation, submission, timeout, and failure flows asynchronously.
- `project/shared/db` - Shared database package containing Drizzle schema definitions, relations, enums, types, and database client setup.
- `project/shared/logger` - Shared Pino logger factory used by services and applications.
- `project/shared/order-contracts` - Shared order event names, message schemas, and queue-related constants.
- `project/shared/cache-contracts` - Shared Redis cache keys, reservation argument builders, and Lua scripts used for atomic stock and usage updates.
