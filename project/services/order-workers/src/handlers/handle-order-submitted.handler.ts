import type { OrderMessage } from '@shared/order-contracts'
import { logger } from '../logger.js'

export async function handleOrderSubmitted(message: OrderMessage): Promise<void> {
  logger.info({ message }, 'Received order.submitted message')
}
