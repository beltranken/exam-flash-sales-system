import { Promo, TemporalStatus } from '@shared/db'
import { Cart, CartRequest, LineIssues } from '@types'
import { FastifyInstance } from 'fastify'
import { getProductService, getUserProductUsageService } from '../../products/services/index.js'
import { getPromoByIdService, getPromosService, getUserPromoUsageService } from '../../promos/services/index.js'

export async function validateCartService(
  fastify: FastifyInstance,
  cartRequest: CartRequest,
  userId?: number,
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
  } else {
    // If no promo applied, check if there's an active promo for the products in the cart
    const productIds = cartRequest.items.map((item) => item.productId)
    const results = await getPromosService(fastify, { productIds, temporalStatus: TemporalStatus.ACTIVE })
    promo = results.at(0)
  }

  const cartItemPromises = cartRequest.items.map(async ({ quantity, appliedPromoId, productId }) => {
    const product = await getProductService(fastify, productId)

    const subtotalInCents = product.priceInCents * quantity
    let discountInCents = 0

    const issues: LineIssues[] = []

    const promoItem = promo?.promoItems?.find((promoItem) => promoItem.productId === productId)
    if (promo && promoItem) {
      discountInCents = Math.floor(product.priceInCents * quantity * (promo.discountPercentage / 100))

      if (appliedPromoId && appliedPromoId !== promo.id) {
        issues.push(LineIssues.PROMO_CHANGE)
      }
    } else if (appliedPromoId) {
      issues.push(LineIssues.PROMO_REMOVED)
    }

    if (promo && userId) {
      const promoUsage = await getUserPromoUsageService(fastify, {
        promoId: promo.id,
        userId,
        productId,
      })

      if (promoItem && promoUsage + quantity > promoItem.limitPerUser) {
        issues.push(LineIssues.PROMO_USAGE_LIMIT_EXCEEDED)
      }
    }

    if (userId) {
      const productUsage = await getUserProductUsageService(fastify, {
        userId,
        productId,
      })

      if (productUsage + quantity > product.limitPerUser) {
        issues.push(LineIssues.PRODUCT_USAGE_LIMIT_EXCEEDED)
      }
    }

    return {
      product,
      quantity,
      subtotalInCents,
      discountInCents,
      totalInCents: subtotalInCents - discountInCents,
      appliedPromo: promoItem ? promo : undefined,
      issues,
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
    issues,
  }
}
