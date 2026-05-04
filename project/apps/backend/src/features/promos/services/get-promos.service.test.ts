import { PromoStatus, TemporalStatus } from '@shared/db'
import { getPromosService } from './get-promos.service.js'

describe('getPromosService', () => {
  it('queries promos with filters and adds temporal status', async () => {
    const now = new Date('2026-05-04T00:00:00.000Z')
    jest.useFakeTimers().setSystemTime(now)
    const promos = [
      { id: 1, startDate: new Date('2026-05-05T00:00:00.000Z'), endDate: new Date('2026-05-06T00:00:00.000Z') },
      { id: 2, startDate: new Date('2026-05-01T00:00:00.000Z'), endDate: new Date('2026-05-03T00:00:00.000Z') },
      { id: 3, startDate: new Date('2026-05-01T00:00:00.000Z'), endDate: new Date('2026-05-05T00:00:00.000Z') },
    ]
    const findMany = jest.fn().mockResolvedValue(promos)
    const fastify = { db: { query: { promosTable: { findMany } } } } as any

    const result = await getPromosService(fastify, {
      page: 2,
      pageSize: 10,
      productIds: [10],
      status: [PromoStatus.ACTIVE],
      temporalStatus: TemporalStatus.ACTIVE,
    })

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 10,
        limit: 10,
        with: { promoItems: true },
      }),
    )
    expect(result.map((promo) => promo.temporalStatus)).toEqual([
      TemporalStatus.UPCOMING,
      TemporalStatus.EXPIRED,
      TemporalStatus.ACTIVE,
    ])
  })
})
