import { PaymentMethod } from '@shared/db'
import { buildFeaturePluginApp } from '../../tests/build-feature-plugin-app.js'
import { getUser } from '../auth/services/get-user.service.js'
import { checkoutPlugin } from './plugin.js'
import {
  createTrackedCartItems,
  reserveCartService,
  toCheckoutResponseCart,
  validateCartService,
} from './services/index.js'
import { validateCartService as validateCartRouteService } from './services/validate-cart.service.js'
import { makeSkipPaymentSkipService } from './services/make-skip-payment.service.js'

jest.mock('../auth/services/get-user.service.js', () => ({
  getUser: jest.fn(),
}))

jest.mock('./services/index.js', () => ({
  createTrackedCartItems: jest.fn(),
  reserveCartService: jest.fn(),
  toCheckoutResponseCart: jest.fn(),
  validateCartService: jest.fn(),
}))

jest.mock('./services/validate-cart.service.js', () => ({
  validateCartService: jest.fn(),
}))

jest.mock('./services/make-skip-payment.service.js', () => ({
  makeSkipPaymentSkipService: jest.fn(),
}))

const product = {
  id: 10,
  name: 'Exam Voucher',
  description: null,
  image: null,
  priceInCents: 1000,
  limitPerUser: 1,
  limitResetIntervalDays: 7,
  createdAt: new Date('2026-05-04T00:00:00.000Z'),
  updatedAt: new Date('2026-05-04T00:00:00.000Z'),
}

const cart = {
  items: [
    {
      product,
      quantity: 1,
      subtotalInCents: 1000,
      discountInCents: 0,
      totalInCents: 1000,
      removalReasons: [],
      warnings: [],
    },
  ],
  subtotalInCents: 1000,
  totalDiscountInCents: 0,
  totalInCents: 1000,
}

describe('checkoutPlugin integration', () => {
  it('registers public payment methods and validate-cart routes', async () => {
    const app = await buildFeaturePluginApp()
    ;(validateCartRouteService as jest.Mock).mockResolvedValue(cart)

    try {
      await app.register(checkoutPlugin, { prefix: '/api' })

      const methodsResponse = await app.inject({ method: 'GET', url: '/api/payment-methods' })
      const validateResponse = await app.inject({
        method: 'POST',
        url: '/api/validate-cart',
        payload: { findActivePromo: true, items: [{ productId: 10, quantity: 1 }] },
      })

      expect(methodsResponse.statusCode).toBe(200)
      expect(methodsResponse.json()).toEqual([
        expect.objectContaining({ id: PaymentMethod.SKIP_PAYMENT }),
        expect.objectContaining({ id: PaymentMethod.STRIPE }),
      ])
      expect(validateResponse.statusCode).toBe(200)
      expect(validateResponse.json()).toMatchObject({ totalInCents: 1000 })
      expect(validateCartRouteService).toHaveBeenCalledWith(
        expect.any(Object),
        { findActivePromo: true, items: [{ productId: 10, quantity: 1 }] },
        undefined,
        { findActivePromo: true },
      )
    } finally {
      await app.close()
    }
  })

  it('registers authenticated checkout route', async () => {
    const app = await buildFeaturePluginApp()
    const trackedCartItems = [
      { ...cart.items[0], reservationStatus: { stocksByProduct: false, userProductUsage: false } },
    ]
    app.decorate('mq', {
      publishOrderReserved: jest.fn().mockResolvedValue(undefined),
      publishOrderTimeout: jest.fn().mockResolvedValue(undefined),
      publishOrderFailed: jest.fn().mockResolvedValue(undefined),
    } as any)
    app.redis.set = jest.fn().mockResolvedValue(undefined)
    app.redis.expire = jest.fn().mockResolvedValue(undefined)
    ;(getUser as jest.Mock).mockResolvedValue({ id: 42, email: 'user@example.com' })
    ;(validateCartService as jest.Mock).mockResolvedValue(cart)
    ;(createTrackedCartItems as jest.Mock).mockReturnValue(trackedCartItems)
    ;(reserveCartService as jest.Mock).mockResolvedValue(undefined)
    ;(toCheckoutResponseCart as jest.Mock).mockReturnValue(cart)

    try {
      await app.register(checkoutPlugin, { prefix: '/api' })
      const response = await app.inject({
        method: 'POST',
        url: '/api/checkout',
        payload: { items: [{ productId: 10, quantity: 1 }] },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        isSuccess: true,
        message: 'Checkout successful',
        cart: {
          totalInCents: 1000,
          items: [expect.objectContaining({ quantity: 1, totalInCents: 1000 })],
        },
      })
      expect(response.json().orderId).toEqual(expect.any(String))
      expect(reserveCartService).toHaveBeenCalledWith(expect.any(Object), trackedCartItems, 42)
      expect(app.mq.publishOrderReserved).toHaveBeenCalled()
      expect(app.mq.publishOrderTimeout).toHaveBeenCalledWith(response.json().orderId)
    } finally {
      await app.close()
    }
  })

  it('registers authenticated skip-payment route', async () => {
    const app = await buildFeaturePluginApp()
    ;(makeSkipPaymentSkipService as jest.Mock).mockResolvedValue(undefined)

    try {
      await app.register(checkoutPlugin, { prefix: '/api' })
      const response = await app.inject({
        method: 'POST',
        url: '/api/payment/skip-payment',
        payload: {
          orderId: '11111111-1111-4111-8111-111111111111',
          paymentMethod: PaymentMethod.SKIP_PAYMENT,
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.body).toBe('')
      expect(makeSkipPaymentSkipService).toHaveBeenCalledWith(expect.any(Object), {
        orderId: '11111111-1111-4111-8111-111111111111',
        paymentMethod: PaymentMethod.SKIP_PAYMENT,
        userId: 42,
      })
    } finally {
      await app.close()
    }
  })

  it('requires authentication for checkout', async () => {
    const app = await buildFeaturePluginApp({ authenticate: 'fail' })

    try {
      await app.register(checkoutPlugin, { prefix: '/api' })
      const response = await app.inject({
        method: 'POST',
        url: '/api/checkout',
        payload: { items: [{ productId: 10, quantity: 1 }] },
      })

      expect(response.statusCode).toBe(401)
      expect(getUser).not.toHaveBeenCalled()
    } finally {
      await app.close()
    }
  })
})
