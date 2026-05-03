import { getUser } from '@features/auth/services/get-user.service.js'
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

    const hasOrderQueuePublished = false
    let hasReservations = false
    try {
      await reserveCartService(fastify, trackerCartItems, req.user.userId)
      hasReservations = true

      // TODO: publish messages

      reply.status(200).send({
        isSuccess: true,
        message: 'Checkout successful',
        cart: toCheckoutResponseCart(cart, trackerCartItems),
        orderId,
      })
    } catch (e) {
      // Rollback any successful reservations in case of error
      if (hasReservations) {
        try {
          await rollbackCartReservationsService(fastify, trackerCartItems, req.user.userId)
          markRollbackReservationFailures(trackerCartItems)
        } catch (rollbackError) {
          fastify.log.error(rollbackError, 'Failed to rollback reservations after checkout failure')
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
