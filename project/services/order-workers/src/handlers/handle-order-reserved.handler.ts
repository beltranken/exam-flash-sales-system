import { db } from '@db'
import { logger } from '@logger'
import type { OrderReservedMessage } from '@shared/order-contracts'

export async function handleOrderReserved(message: OrderReservedMessage): Promise<void> {
  logger.info({ message }, 'Received order.reserved message')

  const user = await db.query.usersTable.findFirst({
    where: {
      id: message.userId,
    },
  })

  if (!user) {
    logger.error({ userId: message.userId }, 'User not found for order.reserved message')
  }
}
