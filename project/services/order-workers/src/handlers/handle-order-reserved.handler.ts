import { db } from '@db'
import { logger } from '@logger'
import { OrderStatus, Warehouse, and, eq, orderItemsTable, ordersTable, productStocksTable, sql } from '@shared/db'
import type { OrderReservedMessage, OrderSubmittedMessage } from '@shared/order-contracts'

type HandleOrderReservedDeps = {
  publishOrderSubmitted: (message: OrderSubmittedMessage) => Promise<void> | void
}

export async function handleOrderReserved(message: OrderReservedMessage, deps: HandleOrderReservedDeps): Promise<void> {
  logger.info({ message }, 'Received order.reserved message')

  let shouldPublishSubmitted = false

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(ordersTable)
      .values({
        id: message.orderId,
        userId: message.userId,
        status: OrderStatus.SUBMITTED,
        note: message.note,
      })
      .onConflictDoNothing({
        target: ordersTable.id,
      })
      .returning({
        id: ordersTable.id,
      })

    if (!order) {
      logger.info({ orderId: message.orderId }, 'Order already exists, skipping order.reserved message')
      return
    }

    await tx.insert(orderItemsTable).values(
      message.items.map((item) => ({
        orderId: message.orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceInCents: item.priceInCents,
        discountPercentage: item.discountPercentage,
        appliedPromoId: item.appliedPromoId ?? null,
      })),
    )

    for (const item of message.items) {
      const updatedStocks = await tx
        .update(productStocksTable)
        .set({
          availableQuantity: sql`${productStocksTable.availableQuantity} - ${item.quantity}`,
          reservedQuantity: sql`${productStocksTable.reservedQuantity} + ${item.quantity}`,
        })
        .where(and(eq(productStocksTable.productId, item.productId), eq(productStocksTable.warehouse, Warehouse.MAIN)))
        .returning({
          productId: productStocksTable.productId,
        })

      if (updatedStocks.length === 0) {
        throw new Error(`Product stock row not found for product ${item.productId}`)
      }
    }

    shouldPublishSubmitted = true
  })

  if (shouldPublishSubmitted) {
    await deps.publishOrderSubmitted({
      orderId: message.orderId,
    })
  }

  logger.info({ orderId: message.orderId }, 'Order reserved successfully')
}
