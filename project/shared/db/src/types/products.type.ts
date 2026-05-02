import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { productsTable, productStocksTable } from '../schemas/products.schema.js'
import { timeStampSchema } from './common.js'
import { basePromoSchema } from './promos.type.js'

export const baseProductSchema = createSelectSchema(productsTable, {
  ...timeStampSchema.shape,
})
export const baseProductStockSchema = createSelectSchema(productStocksTable, {
  ...timeStampSchema.shape,
})

export const productStockSchema = baseProductStockSchema.extend({
  product: baseProductSchema.optional().nullable(),
})
export type ProductStock = z.infer<typeof productStockSchema>

export const productSchema = baseProductSchema.extend({
  availableQuantity: productStockSchema.shape.availableQuantity.optional(),
  activePromos: basePromoSchema.array().optional(),
})
z.globalRegistry.add(productSchema, { id: 'Product' })
export type Product = z.infer<typeof productSchema>

export const paginatedProductsSchema = z.object({
  products: productSchema.array(),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
})
export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>
