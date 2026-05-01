import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { PromoStatus } from '../types/enums.js'
import { timestamps } from './common.js'
import { promoStatusEnum } from './enums.js'
import { productsTable } from './products.schema.js'

// simple promo table for flash sales
export const promosTable = pgTable('promos', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 255 }),
  discountPercentage: integer('discount_percentage').notNull(),
  status: promoStatusEnum('status').notNull().default(PromoStatus.ACTIVE),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  ...timestamps,
})

export const promoItemsTable = pgTable('promo_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  promoId: integer('promo_id')
    .notNull()
    .references(() => promosTable.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => productsTable.id, { onDelete: 'restrict' }),
  limitPerUser: integer('limit_per_user').notNull().default(1),
})
