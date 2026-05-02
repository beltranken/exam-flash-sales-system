import { Promo, TemporalStatus } from '@shared/db'
import { Cart, CartRequest, LineIssues } from '@types'
import { FastifyInstance } from 'fastify'
import { getProductService, getUserProductUsageService } from '../../products/services/index.js'
import { getPromoByIdService, getPromosService, getUserPromoUsageService } from '../../promos/services/index.js'

export async function validateCartService(
  fastify: FastifyInstance,
  cartRequest: CartRequest,
  userId?: number,
  findActivePromo?: boolean,
): Promise<Cart> {
  const issues: LineIssues[] = []

  let promo: Promo | undefined
  if (cartRequest.appliedPromoId) {
    try {
      promo = await getPromoByIdService(fastify, cartRequest.appliedPromoId)
    } catch (e) {
      fastify.log.warn(e)
    }

    if (!promo) {
      issues.push(LineIssues.PROMO_NOT_FOUND)
    }
  } else if (findActivePromo) {
    // For simplicity, if no promo applied, check if there's an active promo for the products in the cart
    const productIds = cartRequest.items.map((item) => item.productId)
    const results = await getPromosService(fastify, { productIds, temporalStatus: TemporalStatus.ACTIVE })
    promo = results.at(0)
  }

  const cartItemPromises = cartRequest.items.map(async ({ quantity, appliedPromoId, productId }) => {
    let product
    try {
      product = await getProductService(fastify, productId)
    } catch (e) {
      fastify.log.warn(e)
      return {
        product: {
          id: productId,
          name: 'Product Not Found',
          description: null,
          image: null,
          limitPerUser: 1,
          limitResetIntervalDays: 7,
          priceInCents: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        quantity,
        subtotalInCents: 0,
        discountInCents: 0,
        totalInCents: 0,
        issues: [LineIssues.PRODUCT_NOT_FOUND],
      }
    }

    const subtotalInCents = product.priceInCents * quantity
    let discountInCents = 0

    const removalReasons: LineIssues[] = []
    const warnings: LineIssues[] = []

    const promoItem = promo?.promoItems?.find((promoItem) => promoItem.productId === productId)
    if (promo && promoItem) {
      discountInCents = Math.floor(product.priceInCents * quantity * (promo.discountPercentage / 100))

      if (appliedPromoId && appliedPromoId !== promo.id) {
        warnings.push(LineIssues.PROMO_CHANGE)
      }
    } else if (appliedPromoId) {
      warnings.push(LineIssues.PROMO_REMOVED)
    }

    if (promo && userId) {
      const promoUsage = await getUserPromoUsageService(fastify, {
        promoId: promo.id,
        userId,
        productId,
      })

      if (promoItem && promoUsage + quantity > promoItem.limitPerUser) {
        removalReasons.push(LineIssues.PROMO_USAGE_LIMIT_EXCEEDED)
      }
    }

    if (userId) {
      const productUsage = await getUserProductUsageService(fastify, {
        userId,
        productId,
      })

      if (productUsage + quantity > product.limitPerUser) {
        removalReasons.push(LineIssues.PRODUCT_USAGE_LIMIT_EXCEEDED)
      }
    }

    fastify.log.info(`Available quantity for product ${productId}: ${product.availableQuantity}`)

    let _quantity = quantity
    if (product.availableQuantity === 0) {
      removalReasons.push(LineIssues.OUT_OF_STOCK)
    } else if (quantity > product.availableQuantity) {
      removalReasons.push(LineIssues.PRODUCT_QUANTITY_CHANGED)
      _quantity = product.availableQuantity
    }

    return {
      product,
      quantity: _quantity,
      subtotalInCents,
      discountInCents,
      totalInCents: subtotalInCents - discountInCents,
      appliedPromo: promoItem ? promo : undefined,
      removalReasons,
      warnings,
    }
  })

  const cartItems = await Promise.all(cartItemPromises)
  const subtotalInCents = cartItems.reduce((sum, item) => sum + item.subtotalInCents, 0)
  const totalDiscountInCents = cartItems.reduce((sum, item) => sum + item.discountInCents, 0)
  const totalInCents = subtotalInCents - totalDiscountInCents

  return {
    appliedPromo: promo,
    items: cartItems,
    subtotalInCents,
    totalDiscountInCents,
    totalInCents,
  }
}
