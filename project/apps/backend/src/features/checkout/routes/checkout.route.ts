import { cacheKeys } from '@shared/db'
import { CartRequest, CheckoutResponse, LineIssues } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import crypto from 'node:crypto'
import { validateCartService } from '../services/validate-cart.service.js'

export interface CheckoutRoute {
  Body: CartRequest
  Reply: CheckoutResponse
}

export function checkoutRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<CheckoutRoute>, reply: FastifyReply<CheckoutRoute>) {
    if (!req.user!.userId) {
      throw createHttpError(401, 'Unauthorized')
    }

    const cart = await validateCartService(fastify, req.body, req.user.userId, false)

    const hasErrors = cart.items.some((item) => item.removalReasons && item.removalReasons.length > 0)
    const hasWarnings = cart.items.some((item) => item.warnings && item.warnings.length > 0)

    if (hasErrors || hasWarnings) {
      reply.status(409).send({
        isSuccess: false,
        message: 'Cart requires review before checkout',
        cart,
      })
      return
    }

    const orderId = crypto.randomUUID()

    interface ReservationStatus {
      stocksByProduct: false | string
      userProductUsage: false | string
      userPromoUsage?: false | string
    }

    const trackerCartItems = cart.items.map((item) => ({
      ...item,
      reservationStatus: {
        stocksByProduct: false,
        userProductUsage: false,
      } as ReservationStatus,
    }))

    const hasOrderQueuePublished = false
    try {
      for (const cartItem of trackerCartItems) {
        const stocksByProduct = cacheKeys.stocksByProduct({ productId: cartItem.product.id })
        const newStock = await fastify.redis.decrby(stocksByProduct, cartItem.quantity)
        if (newStock < 0) {
          // if stock is insufficient, increment back and throw error
          await fastify.redis.incrby(stocksByProduct, cartItem.quantity)
          throw createHttpError(409, 'Product is out of stock: ' + cartItem.product.name)
        }
        cartItem.reservationStatus.stocksByProduct = stocksByProduct

        const userProductUsage = cacheKeys.userProductUsage({ userId: req.user.userId, productId: cartItem.product.id })
        const newUserUsage = await fastify.redis.incrby(userProductUsage, cartItem.quantity)
        if (newUserUsage < 0) {
          await fastify.redis.decrby(userProductUsage, cartItem.quantity)
          throw createHttpError(409, 'User has exceeded usage limit for product: ' + cartItem.product.name)
        }
        cartItem.reservationStatus.userProductUsage = userProductUsage

        if (cartItem.appliedPromo) {
          const promoUsage = cacheKeys.userPromoUsage({
            productId: cartItem.product.id,
            userId: req.user.userId,
            promoId: cartItem.appliedPromo.id,
          })

          cartItem.reservationStatus.userPromoUsage = false
          const newPromoUsage = await fastify.redis.incrby(promoUsage, cartItem.quantity)
          if (newPromoUsage < 0) {
            await fastify.redis.decrby(promoUsage, cartItem.quantity)
            throw createHttpError(409, 'User has exceeded usage limit for promo: ' + cartItem.appliedPromo.name)
          }
          cartItem.reservationStatus.userPromoUsage = promoUsage
        }
      }

      // TODO: publish messages

      reply.status(200).send({
        isSuccess: true,
        message: 'Checkout successful',
        cart,
        orderId,
      })
    } catch (e) {
      // Rollback any successful reservations in case of error
      for (const cartItem of trackerCartItems) {
        cartItem.removalReasons = []
        cartItem.warnings = []

        if (cartItem.reservationStatus.stocksByProduct) {
          await fastify.redis.incrby(cartItem.reservationStatus.stocksByProduct, cartItem.quantity)
          cartItem.removalReasons.push(LineIssues.STOCK_RESERVATION_FAILED)
        }

        if (cartItem.reservationStatus.userProductUsage) {
          await fastify.redis.incrby(cartItem.reservationStatus.userProductUsage, cartItem.quantity)
          cartItem.removalReasons.push(LineIssues.USER_RESERVATION_FAILED)
        }

        if (cartItem.reservationStatus.userPromoUsage) {
          await fastify.redis.incrby(cartItem.reservationStatus.userPromoUsage!, cartItem.quantity)
          cartItem.removalReasons.push(LineIssues.PROMO_RESERVATION_FAILED)
        }
      }

      if (hasOrderQueuePublished) {
        // TODO: publish order cancellation message to rollback any downstream processing if needed
      }

      if (createHttpError.isHttpError(e) && e.statusCode === 409) {
        fastify.log.warn(e)
        reply.status(409).send({
          isSuccess: false,
          message: 'Cart requires review before checkout',
          cart,
        })
        return
      }

      fastify.log.error(e)
      reply.status(500).send({
        isSuccess: false,
        message: 'Failed to process checkout',
        cart,
      })
    }
  }
}
