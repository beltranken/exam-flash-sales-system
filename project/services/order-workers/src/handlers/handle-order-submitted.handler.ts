import { redis } from '@cache'
import { db } from '@db'
import { logger } from '@logger'
import { cacheKeys } from '@shared/cache-contracts'
import { OrderStatus } from '@shared/db'
import type { OrderSubmittedMessage } from '@shared/order-contracts'

async function clearOrderReservationCache(orderId: string): Promise<void> {
  await redis.del(cacheKeys.order({ orderId }))
}

export async function handleOrderSubmitted(message: OrderSubmittedMessage): Promise<void> {
  logger.info({ message }, 'Received order.submitted message')

  const order = await db.query.ordersTable.findFirst({
    where: {
      id: message.orderId,
    },
    with: {
      orderItems: true,
    },
  })

  if (!order) {
    logger.warn({ orderId: message.orderId }, 'Order not found for order.submitted message')
    return
  }

  if (order.status === OrderStatus.SUBMITTED) {
    await clearOrderReservationCache(message.orderId)
    logger.info({ orderId: message.orderId }, 'Order is already submitted, cleared reservation cache')
    return
  }

  if (order.status !== OrderStatus.PENDING) {
    logger.info(
      {
        orderId: message.orderId,
        status: order.status,
      },
      'Order is not pending; skipping order.submitted message',
    )
    return
  }

  logger.info({ orderId: message.orderId }, 'Order submitted successfully')
}
