import { orderSchema } from '@shared/db'
import z from 'zod/v4'
import { cartSchema } from './cart.js'

export const checkoutResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
  cart: cartSchema,
  orderId: orderSchema.shape.id.optional(), // only present if checkout is successful
})
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>
