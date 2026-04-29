import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { promosTable } from '../schemas/promo.schema.js'
import { productSchema } from './products.type.js'

export const basePromoSchema = createSelectSchema(promosTable)
export type BasePromo = z.infer<typeof basePromoSchema>

export const promoSchema = basePromoSchema.extend({
  promoProduct: productSchema.optional().nullable(),
})
export type Promo = z.infer<typeof promoSchema>
