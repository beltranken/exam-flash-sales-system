import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { orderItemsTable, ordersTable } from '../schemas/orders.schema.js'

export const orderItemsSchema = createSelectSchema(orderItemsTable)
export type OrderItem = z.infer<typeof orderItemsSchema>

export const orderSchema = createSelectSchema(ordersTable).extend({
  orderItems: orderItemsSchema.array().optional().nullable(),
})

export type Order = z.infer<typeof orderSchema>
