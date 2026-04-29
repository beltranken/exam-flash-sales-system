import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod/v4'
import { productsTable, productStocksTable } from '../schemas/products.schema.js'

export const baseProductSchema = createSelectSchema(productsTable)
export const baseProductStockSchema = createSelectSchema(productStocksTable)

export const productStockSchema = baseProductStockSchema.extend({
  product: baseProductSchema.optional().nullable(),
})
export type ProductStock = z.infer<typeof productStockSchema>

export const productSchema = baseProductSchema.extend({
  productStock: productStockSchema.optional().nullable(),
})
export type Product = z.infer<typeof productSchema>
