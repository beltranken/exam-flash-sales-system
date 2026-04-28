import { bigint, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from './common.js'
import { stockTransactionTypeEnum, warehouseEnum } from './enums.js'
import { productsTable } from './products.schema.js'

export const stockTransactionsTable = pgTable('stock_transactions', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  referenceId: integer('reference_id'),
  type: stockTransactionTypeEnum('type').notNull(),
  note: text('note'),
  createdAt: timestamps.createdAt,
})

export const stockEntriesTable = pgTable('stock_entries', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  transactionId: bigint('transaction_id', { mode: 'number' })
    .notNull()
    .references(() => stockTransactionsTable.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  warehouse: warehouseEnum('warehouse').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamps.createdAt,
})

/* export const stocksView = pgMaterializedView('stocks').as((qb) =>
  qb
    .select({
      productId: stockEntriesTable.productId,
      warehouse: stockEntriesTable.warehouse,
      quantity: sum(stockEntriesTable.quantity).as('quantity'),
    })
    .from(stockEntriesTable)
    .groupBy(stockEntriesTable.productId, stockEntriesTable.warehouse),
) */
