import { buildFeaturePluginApp } from '../../tests/build-feature-plugin-app.js'
import { productsPlugin } from './plugin.js'
import { getProductService, getProductsService } from './services/index.js'
import { getProductStockService } from './services/get-product-stock.service.js'

jest.mock('./services/index.js', () => ({
  getProductService: jest.fn(),
  getProductsService: jest.fn(),
}))

jest.mock('./services/get-product-stock.service.js', () => ({
  getProductStockService: jest.fn(),
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
  availableQuantity: 5,
}

describe('productsPlugin integration', () => {
  it('registers product list, detail, and stock routes', async () => {
    const app = await buildFeaturePluginApp()
    ;(getProductsService as jest.Mock).mockResolvedValue([product])
    ;(getProductService as jest.Mock).mockResolvedValue(product)
    ;(getProductStockService as jest.Mock).mockResolvedValue(5)

    try {
      await app.register(productsPlugin, { prefix: '/api/products' })

      const listResponse = await app.inject({ method: 'GET', url: '/api/products/?page=2&pageSize=10' })
      const detailResponse = await app.inject({ method: 'GET', url: '/api/products/10' })
      const stockResponse = await app.inject({ method: 'GET', url: '/api/products/10/stock' })

      expect(listResponse.statusCode).toBe(200)
      expect(detailResponse.statusCode).toBe(200)
      expect(stockResponse.statusCode).toBe(200)
      expect(listResponse.json()[0]).toMatchObject({ id: 10, availableQuantity: 5 })
      expect(detailResponse.json()).toMatchObject({ id: 10, availableQuantity: 5 })
      expect(stockResponse.json()).toBe(5)
      expect(getProductsService).toHaveBeenCalledWith(expect.any(Object), { page: 2, pageSize: 10 })
      expect(getProductService).toHaveBeenCalledWith(expect.any(Object), 10)
      expect(getProductStockService).toHaveBeenCalledWith(expect.any(Object), 10)
    } finally {
      await app.close()
    }
  })

  it('rejects invalid product id params', async () => {
    const app = await buildFeaturePluginApp()

    try {
      await app.register(productsPlugin, { prefix: '/api/products' })
      const response = await app.inject({ method: 'GET', url: '/api/products/not-a-number' })

      expect(response.statusCode).toBe(400)
      expect(getProductService).not.toHaveBeenCalled()
    } finally {
      await app.close()
    }
  })
})
