import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { promoItemsTable, promosTable } from '../schemas/promo.schema.js'

export const basePromoSchema = createSelectSchema(promosTable, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.startDate < data.endDate, {
  message: 'startDate must be before endDate',
})

export type BasePromo = z.infer<typeof basePromoSchema>

export const promoItemSchema = createSelectSchema(promoItemsTable)
export type PromoItem = z.infer<typeof promoItemSchema>

export const promoSchema = basePromoSchema.extend({
  promoItems: promoItemSchema.array().optional().nullable(),
  temporalStatus: z.enum(['upcoming', 'active', 'expired']).optional(),
})
export type Promo = z.infer<typeof promoSchema>
