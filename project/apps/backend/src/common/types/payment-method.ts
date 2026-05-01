import z from 'zod/v4'

export const paymentMethodSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
