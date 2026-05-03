import { getUser } from '@features/auth/services/get-user.service.js'
import { OrderReservedMessage } from '@shared/order-contracts'
import { CartRequest, CheckoutResponse } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import createHttpError from 'http-errors'
import crypto from 'node:crypto'
import {
  createTrackedCartItems,
  markRollbackReservationFailures,
  reserveCartService,
  rollbackCartReservationsService,
  toCheckoutResponseCart,
  validateCartService,
} from '../services/index.js'

export interface CheckoutRoute {
  Body: CartRequest
  Reply: CheckoutResponse
}

export function checkoutRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<CheckoutRoute>, reply: FastifyReply<CheckoutRoute>) {
    const user = await getUser(fastify, req.user.userId)

    if (!user) {
      throw createHttpError(401, 'Unauthorized')
    }

    const cart = await validateCartService(fastify, req.body, req.user.userId, false, {
      skipReservationChecks: true,
    })

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

    const trackerCartItems = createTrackedCartItems(cart)

    let hasOrderQueuePublished = false
    let hasReservations = false
    try {
      await reserveCartService(fastify, trackerCartItems, req.user.userId)
      hasReservations = true

      const orderMessage: OrderReservedMessage = {
        orderId,
        userId: user.id,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceInCents: item.product.priceInCents,
          appliedPromoId: item.appliedPromo?.id,
          discountPercentage: item.appliedPromo?.discountPercentage ?? 0,
        })),
      }
      hasReservations = true

      await fastify.mq.publishOrderReserved(orderMessage)
      hasOrderQueuePublished = true

      await fastify.mq.publishOrderTimeout(orderId)

      reply.status(200).send({
        isSuccess: true,
        message: 'Checkout successful',
        cart: toCheckoutResponseCart(cart, trackerCartItems),
        orderId,
      })
    } catch (e) {
      // If order message was published, rollback will be handle by order-worker
      if (hasOrderQueuePublished) {
        try {
          await fastify.mq.publishOrderFailed({
            orderId,
            reason: 'Checkout failed after order was reserved. Manual review may be required.',
          })
        } catch (recoveryError) {
          fastify.log.error(
            {
              error: recoveryError,
              orderId,
            },
            'Critical Error: Failed to publish order failed message after checkout error',
          )
        }
      }
      // Else if reservations were made but an error occurred before publishing order message, rollback here
      else if (hasReservations) {
        try {
          await rollbackCartReservationsService(fastify, trackerCartItems, req.user.userId)
          markRollbackReservationFailures(trackerCartItems)
        } catch (recoveryError) {
          fastify.log.error(
            {
              error: recoveryError,
              orderId,
            },
            'Critical Error: Failed to rollback cart reservations after checkout error',
          )
        }
      }

      if (createHttpError.isHttpError(e) && e.statusCode === 409) {
        fastify.log.warn(e)
        reply.status(409).send({
          isSuccess: false,
          message: 'Cart requires review before checkout',
          cart: toCheckoutResponseCart(cart, trackerCartItems),
        })
        return
      }

      fastify.log.error(e)
      reply.status(500).send({
        isSuccess: false,
        message: 'Failed to process checkout',
        cart: toCheckoutResponseCart(cart, trackerCartItems),
      })
    }
  }
}
