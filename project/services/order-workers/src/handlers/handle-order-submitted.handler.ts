import { redis } from '@cache'
import { db } from '@db'
import { logger } from '@logger'
import { cacheKeys } from '@shared/cache-contracts'
import { OrderStatus, Warehouse, and, eq, gte, ordersTable, productStocksTable, sql } from '@shared/db'
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

  // TODO: revisit to check if below are necessary
  if (order.orderItems.length === 0) {
    throw new Error(`Order ${message.orderId} has no items to submit`)
  }

  await db.transaction(async (tx) => {
    const [submittedOrder] = await tx
      .update(ordersTable)
      .set({
        status: OrderStatus.SUBMITTED,
      })
      .where(and(eq(ordersTable.id, message.orderId), eq(ordersTable.status, OrderStatus.PENDING)))
      .returning({
        id: ordersTable.id,
      })

    if (!submittedOrder) {
      return
    }

    for (const item of order.orderItems) {
      const updatedStocks = await tx
        .update(productStocksTable)
        .set({
          reservedQuantity: sql`${productStocksTable.reservedQuantity} - ${item.quantity}`,
          soldQuantity: sql`${productStocksTable.soldQuantity} + ${item.quantity}`,
        })
        .where(
          and(
            eq(productStocksTable.productId, item.productId),
            eq(productStocksTable.warehouse, Warehouse.MAIN),
            gte(productStocksTable.reservedQuantity, item.quantity),
          ),
        )
        .returning({
          productId: productStocksTable.productId,
        })

      if (updatedStocks.length === 0) {
        throw new Error(`Reserved stock row not found for product ${item.productId}`)
      }
    }
  })

  await clearOrderReservationCache(message.orderId)

  logger.info({ orderId: message.orderId }, 'Order submitted successfully')
}
