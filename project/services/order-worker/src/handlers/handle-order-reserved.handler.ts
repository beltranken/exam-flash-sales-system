import { logger } from '../logger.js'
import { type OrderMessage } from '../types/order-message.js'

export async function handleOrderReserved(message: OrderMessage): Promise<void> {
  logger.info({ message }, 'Received order.reserved message')
  // TODO: create the order record and persist the reserved stock update.
}
