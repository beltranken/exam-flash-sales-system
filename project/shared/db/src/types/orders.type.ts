import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { orderItemsTable, ordersTable } from '../schemas/orders.schema.js'
import { timeStampSchema } from './common.js'
import { paymentSchema } from './payments.type.js'
import { productSchema } from './products.type.js'
import { basePromoSchema } from './promos.type.js'

export const orderItemSchema = createSelectSchema(orderItemsTable, {
  ...timeStampSchema.shape,
}).extend({
  product: productSchema.optional().nullable(),
  appliedPromo: basePromoSchema.optional().nullable(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = createSelectSchema(ordersTable, {
  ...timeStampSchema.shape,
}).extend({
  orderItems: orderItemSchema.array().optional().nullable(),
  payments: paymentSchema.array().optional().nullable(),
})

export type Order = z.infer<typeof orderSchema>

export const orderIdParam = z.object({
  orderId: orderSchema.shape.id,
})

export type OrderIdParam = z.infer<typeof orderIdParam>
