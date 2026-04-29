import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from './common.js'

export const productsTable = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),
  ...timestamps,
})

export const productStocksTable = pgTable('product_stocks', {
  productId: integer('product_id')
    .primaryKey()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  warehouse: varchar('warehouse', { length: 50 }).primaryKey(),
  availableQuantity: integer('available_quantity').notNull(),
  reservedQuantity: integer('reserved_quantity').notNull().default(0),
  soldQuantity: integer('sold_quantity').notNull().default(0),
  ...timestamps,
})
