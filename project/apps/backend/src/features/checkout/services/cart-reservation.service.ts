import {
  buildRollbackReservationArgs,
  buildReservationArgs,
  cacheKeys,
  reserveCartScript,
  rollbackCartReservationsScript,
} from '@shared/cache-contracts'
import { Cart, CartItem, LineIssues } from '@types'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

interface ReservationStatus {
  stocksByProduct: false | string
  userProductUsage: false | string
  userPromoUsage?: false | string
}

export type TrackedCartItem = CartItem & {
  reservationStatus: ReservationStatus
}

const issueByReservationError: Record<string, LineIssues> = {
  OUT_OF_STOCK: LineIssues.OUT_OF_STOCK,
  PRODUCT_USAGE_LIMIT_EXCEEDED: LineIssues.PRODUCT_USAGE_LIMIT_EXCEEDED,
  PROMO_USAGE_LIMIT_EXCEEDED: LineIssues.PROMO_USAGE_LIMIT_EXCEEDED,
}

export const createTrackedCartItems = (cart: Cart): TrackedCartItem[] =>
  cart.items.map((item) => ({
    ...item,
    reservationStatus: {
      stocksByProduct: false,
      userProductUsage: false,
    },
  }))

export const toCheckoutResponseCart = (cart: Cart, trackerCartItems: TrackedCartItem[]): Cart => ({
  ...cart,
  items: trackerCartItems.map((trackerCartItem) => {
    const item: CartItem = {
      product: trackerCartItem.product,
      appliedPromo: trackerCartItem.appliedPromo,
      quantity: trackerCartItem.quantity,
      subtotalInCents: trackerCartItem.subtotalInCents,
      discountInCents: trackerCartItem.discountInCents,
      totalInCents: trackerCartItem.totalInCents,
      removalReasons: trackerCartItem.removalReasons,
      warnings: trackerCartItem.warnings,
    }

    return item
  }),
})

export const markRollbackReservationFailures = (cartItems: TrackedCartItem[]) => {
  for (const cartItem of cartItems) {
    cartItem.removalReasons = []
    cartItem.warnings = []

    if (cartItem.reservationStatus.stocksByProduct) {
      cartItem.removalReasons.push(LineIssues.STOCK_RESERVATION_FAILED)
    }

    if (cartItem.reservationStatus.userProductUsage) {
      cartItem.removalReasons.push(LineIssues.USER_RESERVATION_FAILED)
    }

    if (cartItem.reservationStatus.userPromoUsage) {
      cartItem.removalReasons.push(LineIssues.PROMO_RESERVATION_FAILED)
    }
  }
}

const toReservationItems = (cartItems: TrackedCartItem[]) =>
  cartItems.map((cartItem) => ({
    productId: cartItem.product.id,
    quantity: cartItem.quantity,
    limitPerUser: cartItem.product.limitPerUser,
    limitResetIntervalDays: cartItem.product.limitResetIntervalDays,
    appliedPromoId: cartItem.appliedPromo?.id,
    promoLimitPerUser: cartItem.appliedPromo?.limitPerUser,
  }))

const toRollbackReservationItems = (cartItems: TrackedCartItem[]) =>
  cartItems.map((cartItem) => ({
    productId: cartItem.product.id,
    quantity: cartItem.quantity,
    appliedPromoId: cartItem.appliedPromo?.id,
  }))

const markReserved = (cartItems: TrackedCartItem[], userId: number) => {
  cartItems.forEach((cartItem) => {
    cartItem.reservationStatus.stocksByProduct = cacheKeys.stocksByProduct({ productId: cartItem.product.id })
    cartItem.reservationStatus.userProductUsage = cacheKeys.userProductUsage({ userId, productId: cartItem.product.id })

    if (cartItem.appliedPromo) {
      cartItem.reservationStatus.userPromoUsage = cacheKeys.userPromoUsage({
        productId: cartItem.product.id,
        userId,
        promoId: cartItem.appliedPromo.id,
      })
    }
  })
}

export const reserveCartService = async (fastify: FastifyInstance, cartItems: TrackedCartItem[], userId: number) => {
  const result = (await fastify.redis.eval(
    reserveCartScript,
    0,
    String(cartItems.length),
    ...buildReservationArgs(toReservationItems(cartItems), userId),
  )) as [number, number, string]

  if (result[0] === 1) {
    markReserved(cartItems, userId)
    return
  }

  const failedItem = cartItems[result[1] - 1]
  const issue = issueByReservationError[result[2]]

  if (failedItem && issue) {
    failedItem.removalReasons = [...(failedItem.removalReasons ?? []), issue]
  }

  throw createHttpError(409, 'Cart requires review before checkout')
}

export const rollbackCartReservationsService = async (
  fastify: FastifyInstance,
  cartItems: TrackedCartItem[],
  userId: number,
) => {
  await fastify.redis.eval(
    rollbackCartReservationsScript,
    0,
    String(cartItems.length),
    ...buildRollbackReservationArgs(toRollbackReservationItems(cartItems), userId),
  )
}
