import { OrderConsumer } from './queues/order.consumer.js'
import { logger } from './logger.js'

const consumer = new OrderConsumer()

async function main(): Promise<void> {
  await consumer.start()
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, 'Shutting down order worker')
  await consumer.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch((error) => {
  logger.error({ error }, 'Order worker failed to start')
  process.exit(1)
})
