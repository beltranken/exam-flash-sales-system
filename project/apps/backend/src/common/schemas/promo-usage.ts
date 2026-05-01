import z from 'zod/v4'

export const promoUsageSchema = z.object({
  promoId: z.number().int().positive(),
  userId: z.number().int().positive(),
  productId: z.number().int().positive(),
})

export type PromoUsage = z.infer<typeof promoUsageSchema>
