import { PromoStatus } from '@shared/db'
import { buildFeaturePluginApp } from '../../tests/build-feature-plugin-app.js'
import { promosPlugin } from './plugin.js'
import { getPromosService } from './services/get-promos.service.js'

jest.mock('./services/get-promos.service.js', () => ({
  getPromosService: jest.fn(),
}))

describe('promosPlugin integration', () => {
  it('registers promo list route', async () => {
    const app = await buildFeaturePluginApp()
    ;(getPromosService as jest.Mock).mockResolvedValue([
      {
        id: 20,
        code: 'FLASH10',
        name: 'Flash 10',
        description: null,
        image: null,
        discountPercentage: 10,
        status: PromoStatus.ACTIVE,
        startDate: new Date('2026-05-01T00:00:00.000Z'),
        endDate: new Date('2026-05-10T00:00:00.000Z'),
        limitPerUser: 1,
        createdAt: new Date('2026-05-04T00:00:00.000Z'),
        updatedAt: new Date('2026-05-04T00:00:00.000Z'),
        promoItems: [{ id: 1, promoId: 20, productId: 10 }],
        temporalStatus: 'active',
      },
    ])

    try {
      await app.register(promosPlugin, { prefix: '/api/promos' })
      const response = await app.inject({ method: 'GET', url: '/api/promos/' })

      expect(response.statusCode).toBe(200)
      expect(response.json()[0]).toMatchObject({ id: 20, code: 'FLASH10', temporalStatus: 'active' })
      expect(getPromosService).toHaveBeenCalledWith(expect.any(Object))
    } finally {
      await app.close()
    }
  })
})
