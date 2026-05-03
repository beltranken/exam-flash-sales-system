import { logger } from '../logger.js'
import { type OrderMessage } from '../types/order-message.js'

export async function handleOrderSubmitted(message: OrderMessage): Promise<void> {
  logger.info({ message }, 'Received order.submitted message')
  // TODO: send order confirmation email and clear temporary checkout state.
}
