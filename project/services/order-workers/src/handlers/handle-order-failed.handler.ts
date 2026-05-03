import { redis } from '@cache'
import { db } from '@db'
import { logger } from '@logger'
import { buildRollbackReservationArgs, rollbackCartReservationsScript } from '@shared/cache-contracts'
import {
  and,
  eq,
  ordersTable,
  OrderStatus,
  productStocksTable,
  sql,
  stockTransactionsTable,
  StockTransactionType,
  Warehouse,
} from '@shared/db'
import type { OrderFailedMessage, OrderItem } from '@shared/order-contracts'

async function restoreRedisReservation(items: OrderItem[], userId: number) {
  await redis.eval(
    rollbackCartReservationsScript,
    0,
    String(items.length),
    ...buildRollbackReservationArgs(items, userId),
  )
}

export async function handleOrderFailed(message: OrderFailedMessage): Promise<void> {
  logger.info({ message }, 'Received order.failed message')

  const order = await db.query.ordersTable.findFirst({
    where: {
      id: message.orderId,
    },
    with: {
      orderItems: true,
    },
  })

  const items = message.items ?? order?.orderItems ?? []
  const userId = message.userId ?? order?.userId

  if (order && order.status !== OrderStatus.PENDING) {
    logger.info(
      {
        orderId: message.orderId,
        status: order.status,
      },
      'Order is not pending; skipping order failure compensation',
    )
    return
  }

  if (items.length === 0) {
    logger.warn({ orderId: message.orderId }, 'No order items found for order.failed message')
    return
  }

  if (!userId) {
    logger.warn({ orderId: message.orderId }, 'Cannot restore Redis reservation without a user id')
    return
  }

  await restoreRedisReservation(items, userId)

  if (!order) {
    logger.warn({ orderId: message.orderId }, 'Order not found; restored Redis reservation only')
    return
  }

  await db.transaction(async (tx) => {
    const [cancelledOrder] = await tx
      .update(ordersTable)
      .set({
        status: OrderStatus.CANCELLED,
      })
      .where(and(eq(ordersTable.id, message.orderId ?? ''), eq(ordersTable.status, OrderStatus.PENDING)))
      .returning({
        id: ordersTable.id,
      })

    if (!cancelledOrder) {
      return
    }

    const [stockTransaction] = await tx
      .insert(stockTransactionsTable)
      .values({
        referenceId: message.orderId,
        type: StockTransactionType.RESERVE_CANCEL,
        note: message.reason,
      })
      .returning({
        id: stockTransactionsTable.id,
      })

    if (!stockTransaction) {
      throw new Error('Failed to create stock reservation cancellation transaction')
    }

    for (const item of items) {
      await tx
        .update(productStocksTable)
        .set({
          availableQuantity: sql`${productStocksTable.availableQuantity} + ${item.quantity}`,
          reservedQuantity: sql`${productStocksTable.reservedQuantity} - ${item.quantity}`,
        })
        .where(and(eq(productStocksTable.productId, item.productId), eq(productStocksTable.warehouse, Warehouse.MAIN)))
    }
  })

  logger.info({ orderId: message.orderId }, 'Order failure compensation completed')
}
