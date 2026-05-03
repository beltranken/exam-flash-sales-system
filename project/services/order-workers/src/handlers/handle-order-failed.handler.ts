import { logger } from '@logger'
import type { OrderMessage } from '@shared/order-contracts'

export async function handleOrderFailed(message: OrderMessage): Promise<void> {
  logger.info({ message }, 'Received order.failed message')
  // TODO: rollback stock reservation and update order status if the order exists.
}
