import { PagingRequest, PromoStatus, TemporalStatus } from '@shared/db'
import { FastifyInstance } from 'fastify'

type Param = Partial<PagingRequest> & {
  productIds?: number[]
  status?: PromoStatus[]
  temporalStatus?: TemporalStatus
}

export async function getPromosService(
  fastify: FastifyInstance,
  { page = 1, pageSize = 0, productIds, status, temporalStatus }: Param = { page: 1, pageSize: 0 },
) {
  const offset = (page - 1) * pageSize
  const limit = pageSize > 0 ? pageSize : undefined

  const now = new Date()
  let temporalWhere = {}
  switch (temporalStatus) {
    case TemporalStatus.UPCOMING:
      temporalWhere = {
        startDate: { gt: now },
      }
      break
    case TemporalStatus.EXPIRED:
      temporalWhere = {
        endDate: { lt: now },
      }
      break
    case TemporalStatus.ACTIVE:
      temporalWhere = {
        startDate: { lte: now },
        endDate: { gte: now },
      }
      break
  }

  const promos = await fastify.db.query.promosTable.findMany({
    where: {
      ...temporalWhere,
      status: status ? { in: status } : PromoStatus.ACTIVE,
      promoItems: productIds ? { productId: { in: productIds } } : undefined,
    },
    with: {
      promoItems: true,
    },
    offset,
    limit,
  })

  return promos
}
