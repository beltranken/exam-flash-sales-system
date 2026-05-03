import { MakePaymentRequest, paymentsTable, PaymentStatus, User } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function makeSkipPaymentSkipService(
  fastify: FastifyInstance,
  data: MakePaymentRequest & { userId: User['id'] },
) {
  const order = await fastify.db.query.ordersTable.findFirst({
    where: {
      id: data.orderId,
      userId: data.userId,
    },
    with: {
      orderItems: true,
      payments: true,
    },
  })

  if (!order) {
    throw new createHttpError.Conflict('Order not found for user')
  }

  const totalOrderAmount = order.orderItems.reduce(
    (sum, item) => sum + item.priceInCents * item.quantity * (1 - item.discountPercentage / 100),
    0,
  )

  const totalPayments = order.payments.reduce((sum, payment) => sum + payment.amountInCents, 0)
  if (totalPayments >= totalOrderAmount) {
    throw new createHttpError.Conflict('Order is already fully paid')
  }

  await fastify.db.insert(paymentsTable).values({
    orderId: data.orderId,
    method: data.paymentMethod,
    amountInCents: totalOrderAmount - totalPayments,
    status: PaymentStatus.PAID,
  })
}
