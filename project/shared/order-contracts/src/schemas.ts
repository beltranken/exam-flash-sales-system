import z from 'zod/v4'

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  priceInCents: z.number().int().positive(),
  discountPercentage: z.number().int().min(0).max(100).default(0),
  appliedPromoId: z.number().int().positive().nullable().optional(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

export const uuidSchema = z.uuid()
export type OrderId = z.infer<typeof uuidSchema>

export const orderReservedMessageSchema = z.object({
  status: z.literal('pending'),
  orderId: uuidSchema,
  userId: z.number().int().positive(),
  note: z.string().optional(),
  items: z.array(orderItemSchema),
})

export type OrderReservedMessage = z.infer<typeof orderReservedMessageSchema>

export const orderFailedMessageSchema = z.object({
  orderId: uuidSchema.optional(),
  reason: z.string(),
  userId: z.number().int().positive().optional(),
  items: z.array(orderItemSchema).optional(),
})
export type OrderFailedMessage = z.infer<typeof orderFailedMessageSchema>

const objOrderIdSchema = z.object({
  orderId: uuidSchema,
})

export const orderSubmittedMessageSchema = objOrderIdSchema
export type OrderSubmittedMessage = z.infer<typeof orderSubmittedMessageSchema>

export const orderTimeoutMessageSchema = objOrderIdSchema
export type OrderTimeoutMessage = z.infer<typeof orderTimeoutMessageSchema>

export const makePaymentMessageSchema = z.object({
  orderId: uuidSchema,
  paymentMethod: z.string(),
  paymentId: uuidSchema,
})
export type MakePaymentMessage = z.infer<typeof makePaymentMessageSchema>
