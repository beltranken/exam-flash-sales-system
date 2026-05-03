import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { paymentsTable } from '../schemas/payments.schema.js'
import { PaymentMethod } from './enums.js'

export const paymentSchema = createSelectSchema(paymentsTable)
export type Payment = z.infer<typeof paymentSchema>

export const paymentMethodResponseSchema = z.object({
  id: z.enum(PaymentMethod),
  name: z.string(),
  description: z.string().optional(),
})
export type PaymentMethodResponse = z.infer<typeof paymentMethodResponseSchema>

export const makePaymentRequestSchema = z.object({
  orderId: paymentSchema.shape.orderId,
  paymentMethod: paymentMethodResponseSchema.shape.id,
})
export type MakePaymentRequest = z.infer<typeof makePaymentRequestSchema>
