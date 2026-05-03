# Exam Flash Sales System

A simplified ecommerce system for a highly anticipated flash sale, where a limited-edition product becomes available for a fixed period and thousands of users may attempt to purchase it at the same time.

The system is designed to handle sudden traffic spikes gracefully, manage inventory accurately, enforce per-user purchase limits, and provide a reliable user experience under high-concurrency conditions. It demonstrates high throughput and scalability, robustness and fault tolerance, and concurrency control in a flash-sale workload.

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

Create environment files for the backend, database package, and order worker. The order worker includes an example at `project/services/order-workers/.env.example`.

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
pnpm --filter @shared/db db:migrate
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
pnpm --filter @tools/stress-test dev
```

## Projects

- `project/apps/backend` - Fastify API for authentication, product browsing, cart validation, checkout, Redis reservations, and RabbitMQ event publishing.
- `project/apps/frontend` - Web client for users to browse products, manage the cart, and submit checkout requests.
- `project/services/order-workers` - Background worker that consumes order events from RabbitMQ and processes reservation, submission, timeout, and failure flows asynchronously.
- `project/shared/db` - Shared database package containing Drizzle schema definitions, relations, enums, types, and database client setup.
- `project/shared/logger` - Shared Pino logger factory used by services and applications.
- `project/shared/order-contracts` - Shared order event names, message schemas, and queue-related constants.
- `project/shared/cache-contracts` - Shared Redis cache keys, reservation argument builders, and Lua scripts used for atomic stock and usage updates.
