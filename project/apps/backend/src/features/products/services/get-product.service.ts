import { Product, productSchema } from '@shared/db'
import { getCacheData } from '@utils'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'
import { getProductStockService } from './get-product-stock.service.js'

export async function getProductService(
  fastify: FastifyInstance,
  productId: number,
  options: { includeStock?: boolean } = {},
): Promise<Product & { availableQuantity: number }> {
  fastify.log.info('Fetching product by id')

  const cacheKey = `product:${productId}`

  const cachedProduct = await getCacheData(fastify, cacheKey, productSchema)

  let product
  if (cachedProduct) {
    product = cachedProduct
    fastify.log.info(`Cache hit for product: ${productId}`)
  } else {
    product = await fastify.db.query.productsTable.findFirst({
      where: {
        id: productId,
      },
    })
  }

  if (!product) {
    throw new createHttpError.NotFound('Product not found')
  }

  await fastify.redis.set(cacheKey, JSON.stringify(product), 'EX', 10) // Cache for 10 seconds

  const signedImage = await fastify.s3.signUrl(product.image ?? '')

  const availableQuantity =
    options.includeStock === false ? Number.MAX_SAFE_INTEGER : await getProductStockService(fastify, productId)

  return {
    ...product,
    image: signedImage,
    availableQuantity,
  }
}
