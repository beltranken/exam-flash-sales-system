import { logger } from '../logger.js'
import type { OrderSubmittedMessage } from '@shared/order-contracts'

export async function handleOrderSubmitted(message: OrderSubmittedMessage): Promise<void> {
  logger.info({ message }, 'Received order.submitted message')
}
