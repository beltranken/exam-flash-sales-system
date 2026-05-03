import { logger } from '../logger.js'
import { type OrderMessage } from '../types/order-message.js'

export async function handleOrderFailed(message: OrderMessage): Promise<void> {
  logger.info({ message }, 'Received order.failed message')
  // TODO: rollback stock reservation and update order status if the order exists.
}
