import { getOrSetNumberCache } from '@utils'
import { FastifyInstance } from 'fastify'
import { getProductService } from './get-product.service.js'

export async function getProductStockService(fastify: FastifyInstance, productId: number): Promise<number> {
  const availableStock = await getOrSetNumberCache(fastify, `product-stocks:${productId}`, async () => {
    const product = await getProductService(fastify, productId)
    return product.productStock?.availableQuantity ?? 0
  })

  return availableStock
}
