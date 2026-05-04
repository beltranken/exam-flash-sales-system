import { OrderStatus } from '@shared/db'
import { buildFeaturePluginApp } from '../../tests/build-feature-plugin-app.js'
import { ordersPlugin } from './plugin.js'
import { getMyOrderByIdService, getMyOrdersService } from './services/index.js'
import { getMyOrderStatusService } from './services/get-my-order-status.service.js'

jest.mock('./services/index.js', () => ({
  getMyOrderByIdService: jest.fn(),
  getMyOrdersService: jest.fn(),
}))

jest.mock('./services/get-my-order-status.service.js', () => ({
  getMyOrderStatusService: jest.fn(),
}))

const order = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: 42,
  status: OrderStatus.SUBMITTED,
  note: null,
  createdAt: new Date('2026-05-04T00:00:00.000Z'),
  updatedAt: new Date('2026-05-04T00:00:00.000Z'),
  totalAmountInCents: 1000,
  orderItems: [],
  payments: [],
}

describe('ordersPlugin integration', () => {
  it('registers authenticated order list, detail, and status routes', async () => {
    const app = await buildFeaturePluginApp()
    ;(getMyOrdersService as jest.Mock).mockResolvedValue([order])
    ;(getMyOrderByIdService as jest.Mock).mockResolvedValue(order)
    ;(getMyOrderStatusService as jest.Mock).mockResolvedValue(OrderStatus.SUBMITTED)

    try {
      await app.register(ordersPlugin, { prefix: '/api/orders' })

      const listResponse = await app.inject({ method: 'GET', url: '/api/orders/my' })
      const statusResponse = await app.inject({
        method: 'GET',
        url: '/api/orders/my/11111111-1111-4111-8111-111111111111/status',
      })
      const detailResponse = await app.inject({
        method: 'GET',
        url: '/api/orders/my/11111111-1111-4111-8111-111111111111',
      })

      expect(listResponse.statusCode).toBe(200)
      expect(statusResponse.statusCode).toBe(200)
      expect(detailResponse.statusCode).toBe(200)
      expect(listResponse.json()[0]).toMatchObject({ id: order.id, totalAmountInCents: 1000 })
      expect(statusResponse.body).toBe(OrderStatus.SUBMITTED)
      expect(detailResponse.json()).toMatchObject({ id: order.id, totalAmountInCents: 1000 })
      expect(getMyOrdersService).toHaveBeenCalledWith(expect.any(Object), 42)
      expect(getMyOrderStatusService).toHaveBeenCalledWith(expect.any(Object), 42, order.id)
      expect(getMyOrderByIdService).toHaveBeenCalledWith(expect.any(Object), 42, order.id)
    } finally {
      await app.close()
    }
  })

  it('requires authentication for order routes', async () => {
    const app = await buildFeaturePluginApp({ authenticate: 'fail' })

    try {
      await app.register(ordersPlugin, { prefix: '/api/orders' })
      const response = await app.inject({ method: 'GET', url: '/api/orders/my' })

      expect(response.statusCode).toBe(401)
      expect(getMyOrdersService).not.toHaveBeenCalled()
    } finally {
      await app.close()
    }
  })
})
