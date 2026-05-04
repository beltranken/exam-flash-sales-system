import { PaymentStatus } from '@shared/db'
import { makeSkipPaymentSkipService } from './make-skip-payment.service.js'

describe('makeSkipPaymentSkipService', () => {
  it('creates a paid payment for the remaining order amount', async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: 7,
      orderItems: [{ priceInCents: 1000, quantity: 2, discountPercentage: 25 }],
      payments: [{ amountInCents: 500 }],
    })
    const values = jest.fn().mockResolvedValue(undefined)
    const insert = jest.fn().mockReturnValue({ values })
    const fastify = { db: { query: { ordersTable: { findFirst } }, insert } } as any

    await makeSkipPaymentSkipService(fastify, { orderId: 7, userId: 42, paymentMethod: 'credit_card' } as any)

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 7, userId: 42 },
      with: { orderItems: true, payments: true },
    })
    expect(values).toHaveBeenCalledWith({
      orderId: 7,
      method: 'credit_card',
      amountInCents: 1000,
      status: PaymentStatus.PAID,
    })
  })

  it('throws when the order does not belong to the user', async () => {
    const fastify = {
      db: {
        query: { ordersTable: { findFirst: jest.fn().mockResolvedValue(undefined) } },
      },
    } as any

    await expect(
      makeSkipPaymentSkipService(fastify, { orderId: 99, userId: 42, paymentMethod: 'credit_card' } as any),
    ).rejects.toThrow('Order not found for user')
  })

  it('throws when the order is already fully paid', async () => {
    const fastify = {
      db: {
        query: {
          ordersTable: {
            findFirst: jest.fn().mockResolvedValue({
              orderItems: [{ priceInCents: 1000, quantity: 1, discountPercentage: 0 }],
              payments: [{ amountInCents: 1000 }],
            }),
          },
        },
      },
    } as any

    await expect(
      makeSkipPaymentSkipService(fastify, { orderId: 7, userId: 42, paymentMethod: 'credit_card' } as any),
    ).rejects.toThrow('Order is already fully paid')
  })
})
