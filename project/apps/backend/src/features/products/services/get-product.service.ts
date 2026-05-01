import { cacheKeys, Product, productSchema } from '@shared/db'
import { getCacheData } from '@utils'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getProductService(fastify: FastifyInstance, productId: number): Promise<Product> {
  fastify.log.info('Fetching product by id')

  const cacheKey = `product:${productId}`

  const cachedProduct = await getCacheData(fastify, cacheKey, productSchema)

  let product
  if (cachedProduct) {
    product = cachedProduct
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

  const availableQuantity = await fastify.redis.get(cacheKeys.stocksByProduct({ productId }))
  const availableQuantityNumber = Number(availableQuantity)

  return {
    ...product,
    image: signedImage,
    availableQuantity: Number.isFinite(availableQuantityNumber) ? availableQuantityNumber : 0,
  }
}
