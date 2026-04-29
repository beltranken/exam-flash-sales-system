import { Product, productSchema } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'
import { getCacheData } from '../../../common/utils/index.js'

export async function getProductService(fastify: FastifyInstance, productId: number): Promise<Product> {
  fastify.log.info('Fetching product by id')

  const cacheKey = `product:${productId}`

  const cachedProduct = await getCacheData(fastify, cacheKey, productSchema)
  if (cachedProduct) {
    return cachedProduct
  }

  const product = await fastify.db.query.productsTable.findFirst({
    where: {
      id: productId,
    },
    with: {
      productStock: true,
    },
  })

  if (!product) {
    throw new createHttpError.NotFound('Product not found')
  }

  await fastify.redis.set(cacheKey, JSON.stringify(product), 'EX', 10) // Cache for 10 seconds

  return product
}
