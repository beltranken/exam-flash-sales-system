import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { promosTable } from '../schemas/promo.schema.js'
import { productSchema } from './products.type.js'

export const promoSchema = createSelectSchema(promosTable).extend({
  promoProducts: productSchema.array().optional().nullable(),
})
export type Promo = z.infer<typeof promoSchema>
