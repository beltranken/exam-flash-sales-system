# Exam Flash Sales System

A simplified ecommerce system for a highly anticipated flash sale, where a limited-edition product becomes available for a fixed period and thousands of users may attempt to purchase it at the same time.

The system is designed to handle sudden traffic spikes gracefully, manage inventory accurately, enforce per-user purchase limits, and provide a reliable user experience under high-concurrency conditions. It demonstrates high throughput and scalability, robustness and fault tolerance, and concurrency control in a flash-sale workload.

## Projects

- `project/apps/backend` - Fastify API for authentication, product browsing, cart validation, checkout, Redis reservations, and RabbitMQ event publishing.
- `project/apps/frontend` - Web client for users to browse products, manage the cart, and submit checkout requests.
- `project/services/order-workers` - Background worker that consumes order events from RabbitMQ and processes reservation, submission, timeout, and failure flows asynchronously.
- `project/shared/db` - Shared database package containing Drizzle schema definitions, relations, enums, types, and database client setup.
- `project/shared/logger` - Shared Pino logger factory used by services and applications.
- `project/shared/order-contracts` - Shared order event names, message schemas, and queue-related constants.
- `project/shared/cache-contracts` - Shared Redis cache keys, reservation argument builders, and Lua scripts used for atomic stock and usage updates.
