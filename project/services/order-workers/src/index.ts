import 'dotenv/config'

import { redis } from './cache.js'
import { pool } from './db.js'
import { logger } from './logger.js'
import { OrderEventConsumer } from './queues/order-event.consumer.js'

const consumer = new OrderEventConsumer()
let isShuttingDown = false

async function main(): Promise<void> {
  await consumer.start()
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  logger.info({ signal }, 'Shutting down order worker')

  try {
    await consumer.stop()
    redis.disconnect()
    await pool.end()
    process.exit(0)
  } catch (error) {
    logger.error({ error }, 'Order worker failed to shut down cleanly')
    process.exit(1)
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch((error) => {
  logger.error({ error }, 'Order worker failed to start')
  process.exit(1)
})
