import z from 'zod/v4'

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  priceInCents: z.number().int().positive(),
  discountPercentage: z.number().int().min(0).max(100).default(0),
  appliedPromoId: z.number().int().positive().nullable().optional(),
})

export const orderIdSchema = z.uuid()
export type OrderId = z.infer<typeof orderIdSchema>

export const orderReservedMessageSchema = z.object({
  orderId: orderIdSchema,
  userId: z.number().int().positive(),
  note: z.string().optional(),
  items: z.array(orderItemSchema),
})

export type OrderReservedMessage = z.infer<typeof orderReservedMessageSchema>

export const orderFailedMessageSchema = z.object({
  orderId: orderIdSchema,
  reason: z.string(),
})
export type OrderFailedMessage = z.infer<typeof orderFailedMessageSchema>

const objOrderIdSchema = z.object({
  orderId: orderIdSchema,
})

export const orderSubmittedMessageSchema = objOrderIdSchema
export type OrderSubmittedMessage = z.infer<typeof orderSubmittedMessageSchema>

export const orderTimeoutMessageSchema = objOrderIdSchema
export type OrderTimeoutMessage = z.infer<typeof orderTimeoutMessageSchema>
