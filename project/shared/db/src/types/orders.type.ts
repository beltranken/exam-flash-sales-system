import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { orderItemsTable, ordersTable } from '../schemas/orders.schema.js'
import { productSchema } from './products.type.js'
import { basePromoSchema } from './promos.type.js'

export const orderItemSchema = createSelectSchema(orderItemsTable).extend({
  product: productSchema.optional().nullable(),
  appliedPromo: basePromoSchema.optional().nullable(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = createSelectSchema(ordersTable).extend({
  orderItems: orderItemSchema.array().optional().nullable(),
})

export type Order = z.infer<typeof orderSchema>
