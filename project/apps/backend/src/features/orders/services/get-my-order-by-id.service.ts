import { Order, PaymentStatus, User } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getMyOrderByIdService(
  fastify: FastifyInstance,
  userId: User['id'],
  orderId: Order['id'],
): Promise<Order> {
  const order = await fastify.db.query.ordersTable.findFirst({
    where: {
      userId,
      id: orderId,
    },
    with: {
      orderItems: {
        with: {
          product: true,
          appliedPromo: true,
        },
      },
      payments: {
        where: {
          status: {
            OR: [PaymentStatus.PAID, PaymentStatus.PENDING],
          },
        },
      },
    },
  })

  if (!order) {
    throw new createHttpError.NotFound('Order not found')
  }

  return order
}
