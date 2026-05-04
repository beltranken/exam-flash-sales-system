import { TemporalStatus } from '@shared/db'
import { LineIssues } from '@types'
import { getProductService, getUserProductUsageService } from '../../products/services/index.js'
import { getPromoByIdService, getPromosService, getUserPromoUsageService } from '../../promos/services/index.js'
import { validateCartService } from './validate-cart.service.js'

jest.mock('../../products/services/index.js', () => ({
  getProductService: jest.fn(),
  getUserProductUsageService: jest.fn(),
}))

jest.mock('../../promos/services/index.js', () => ({
  getPromoByIdService: jest.fn(),
  getPromosService: jest.fn(),
  getUserPromoUsageService: jest.fn(),
}))

const product = {
  id: 10,
  name: 'Exam Voucher',
  description: null,
  image: null,
  priceInCents: 1000,
  limitPerUser: 2,
  limitResetIntervalDays: 7,
  availableQuantity: 5,
} as any

const promo = {
  id: 20,
  discountPercentage: 10,
  limitPerUser: 2,
  promoItems: [{ productId: 10 }],
} as any

describe('validateCartService', () => {
  it('builds totals, applies promo discount, and checks usage limits', async () => {
    ;(getPromoByIdService as jest.Mock).mockResolvedValue(promo)
    ;(getProductService as jest.Mock).mockResolvedValue(product)
    ;(getUserPromoUsageService as jest.Mock).mockResolvedValue(0)
    ;(getUserProductUsageService as jest.Mock).mockResolvedValue(0)
    const fastify = { log: { warn: jest.fn(), info: jest.fn() } } as any

    const result = await validateCartService(
      fastify,
      { appliedPromoId: 20, items: [{ productId: 10, quantity: 2, appliedPromoId: 20 }] },
      42,
    )

    expect(result.items[0]).toMatchObject({
      product,
      quantity: 2,
      discountInCents: 200,
      totalInCents: 1800,
      appliedPromo: promo,
      removalReasons: [],
      warnings: [],
    })
    expect(result).toMatchObject({
      subtotalInCents: 2000,
      totalDiscountInCents: 200,
      totalInCents: 1800,
    })
  })

  it('finds an active promo when requested and no promo is applied', async () => {
    ;(getPromosService as jest.Mock).mockResolvedValue([promo])
    ;(getProductService as jest.Mock).mockResolvedValue(product)
    const fastify = { log: { warn: jest.fn(), info: jest.fn() } } as any

    await validateCartService(fastify, { items: [{ productId: 10, quantity: 1 }] }, undefined, {
      skipReservationChecks: true,
      findActivePromo: true,
    })

    expect(getPromosService).toHaveBeenCalledWith(fastify, {
      productIds: [10],
      temporalStatus: TemporalStatus.ACTIVE,
    })
  })

  it('returns product-not-found cart item when product lookup fails', async () => {
    ;(getProductService as jest.Mock).mockRejectedValue(new Error('missing'))
    const fastify = { log: { warn: jest.fn(), info: jest.fn() } } as any

    const result = await validateCartService(fastify, { items: [{ productId: 404, quantity: 1 }] })

    expect(result.items[0]).toMatchObject({
      product: { id: 404, name: 'Product Not Found' },
      issues: [LineIssues.PRODUCT_NOT_FOUND],
    })
    expect(fastify.log.warn).toHaveBeenCalled()
  })

  it('marks quantity and usage issues that require cart review', async () => {
    ;(getPromoByIdService as jest.Mock).mockResolvedValue(promo)
    ;(getProductService as jest.Mock).mockResolvedValue({ ...product, availableQuantity: 1 })
    ;(getUserPromoUsageService as jest.Mock).mockResolvedValue(1)
    ;(getUserProductUsageService as jest.Mock).mockResolvedValue(1)
    const fastify = { log: { warn: jest.fn(), info: jest.fn() } } as any

    const result = await validateCartService(
      fastify,
      { appliedPromoId: 20, items: [{ productId: 10, quantity: 2, appliedPromoId: 99 }] },
      42,
    )

    expect(result.items[0].quantity).toBe(1)
    expect(result.items[0].warnings).toEqual([LineIssues.PROMO_CHANGE])
    expect(result.items[0].removalReasons).toEqual([
      LineIssues.PROMO_USAGE_LIMIT_EXCEEDED,
      LineIssues.PRODUCT_USAGE_LIMIT_EXCEEDED,
      LineIssues.PRODUCT_QUANTITY_CHANGED,
    ])
  })
})
