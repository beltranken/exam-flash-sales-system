import { LineIssues } from '@types'
import {
  createTrackedCartItems,
  reserveCartService,
  rollbackCartReservationsService,
  toCheckoutResponseCart,
  TrackedCartItem,
} from './cart-reservation.service.js'

const product = {
  id: 10,
  name: 'Exam Voucher',
  limitPerUser: 2,
  limitResetIntervalDays: 7,
} as any

const cart = {
  items: [
    {
      product,
      quantity: 1,
      subtotalInCents: 1000,
      discountInCents: 0,
      totalInCents: 1000,
    },
  ],
  subtotalInCents: 1000,
  totalDiscountInCents: 0,
  totalInCents: 1000,
} as any

describe('cart reservation services', () => {
  it('creates tracked cart items and strips reservation state from checkout response', () => {
    const trackedItems = createTrackedCartItems(cart)

    expect(trackedItems[0].reservationStatus).toEqual({
      stocksByProduct: false,
      userProductUsage: false,
    })
    expect(toCheckoutResponseCart(cart, trackedItems).items[0]).not.toHaveProperty('reservationStatus')
  })

  it('marks cart items as reserved when the Redis script succeeds', async () => {
    const evalMock = jest.fn().mockResolvedValue([1, 0, ''])
    const fastify = { redis: { eval: evalMock } } as any
    const trackedItems = createTrackedCartItems(cart)

    await reserveCartService(fastify, trackedItems, 42)

    expect(evalMock).toHaveBeenCalled()
    expect(trackedItems[0].reservationStatus.stocksByProduct).toBe('stocksByProduct:10')
    expect(trackedItems[0].reservationStatus.userProductUsage).toBe('userProductUsage:42:10')
  })

  it('marks failed line item and throws when reservation is rejected', async () => {
    const evalMock = jest.fn().mockResolvedValue([0, 1, 'OUT_OF_STOCK'])
    const fastify = { redis: { eval: evalMock } } as any
    const trackedItems = createTrackedCartItems(cart)

    await expect(reserveCartService(fastify, trackedItems, 42)).rejects.toThrow('Cart requires review before checkout')
    expect(trackedItems[0].removalReasons).toEqual([LineIssues.OUT_OF_STOCK])
  })

  it('runs rollback script for tracked reservations', async () => {
    const evalMock = jest.fn().mockResolvedValue([1])
    const fastify = { redis: { eval: evalMock } } as any
    const trackedItems: TrackedCartItem[] = createTrackedCartItems(cart)

    await rollbackCartReservationsService(fastify, trackedItems, 42)

    expect(evalMock).toHaveBeenCalled()
  })
})
