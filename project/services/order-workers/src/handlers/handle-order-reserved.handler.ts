import { db } from '@db'
import { logger } from '@logger'
import {
  OrderStatus,
  StockTransactionType,
  Warehouse,
  and,
  eq,
  orderItemsTable,
  ordersTable,
  productStocksTable,
  sql,
  stockEntriesTable,
  stockTransactionsTable,
} from '@shared/db'
import { OrderReservedMessage } from '@shared/order-contracts'

export async function handleOrderReserved(message: OrderReservedMessage): Promise<void> {
  logger.info({ message }, 'Received order.reserved message')

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(ordersTable)
        .values({
          id: message.orderId,
          userId: message.userId,
          status: OrderStatus.PENDING,
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

      const [stockTransaction] = await tx
        .insert(stockTransactionsTable)
        .values({
          referenceId: message.orderId,
          type: StockTransactionType.RESERVE,
          note: 'Order reserved',
        })
        .returning({
          id: stockTransactionsTable.id,
        })

      if (!stockTransaction) {
        throw new Error('Failed to create stock reservation transaction')
      }

      for (const item of message.items) {
        const updatedStocks = await tx
          .update(productStocksTable)
          .set({
            availableQuantity: sql`${productStocksTable.availableQuantity} - ${item.quantity}`,
            reservedQuantity: sql`${productStocksTable.reservedQuantity} + ${item.quantity}`,
          })
          .where(
            and(eq(productStocksTable.productId, item.productId), eq(productStocksTable.warehouse, Warehouse.MAIN)),
          )
          .returning({
            productId: productStocksTable.productId,
          })

        if (updatedStocks.length === 0) {
          throw new Error(`Product stock row not found for product ${item.productId}`)
        }
      }

      await tx.insert(stockEntriesTable).values(
        message.items.flatMap((item) => [
          {
            transactionId: stockTransaction.id,
            productId: item.productId,
            warehouse: Warehouse.MAIN,
            quantity: -item.quantity,
          },
          {
            transactionId: stockTransaction.id,
            productId: item.productId,
            warehouse: Warehouse.RESERVE,
            quantity: item.quantity,
          },
        ]),
      )
    })

    logger.info({ orderId: message.orderId }, 'Order reserved successfully')
  } catch (error) {
    console.log('Error processing order.reserved message:', error)
    logger.error({ error }, 'Failed to process order.reserved message')
  }
}
