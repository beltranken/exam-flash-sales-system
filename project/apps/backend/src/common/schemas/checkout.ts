import { orderSchema } from '@shared/db'
import z from 'zod/v4'
import { cartSchema } from './cart.js'

export const baseCheckoutResponseSchema = z.object({
  message: z.string(),
  cart: cartSchema,
})

export const sucessCheckoutResponseSchema = baseCheckoutResponseSchema.extend({
  isSuccess: z.literal(true),
  orderId: orderSchema.shape.id,
})

export const failedCheckoutResponseSchema = baseCheckoutResponseSchema.extend({
  isSuccess: z.literal(false),
  orderId: orderSchema.shape.id.optional(),
})

export const checkoutResponseSchema = z.discriminatedUnion('isSuccess', [
  sucessCheckoutResponseSchema,
  failedCheckoutResponseSchema,
])

export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>
