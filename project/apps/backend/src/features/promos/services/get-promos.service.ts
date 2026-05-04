import { cacheKeys } from '@shared/cache-contracts'
import { PagingRequest, promoSchema, PromoStatus, TemporalStatus } from '@shared/db'
import { getCacheData } from '@utils'
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
  fastify.log.info({ page, pageSize, productIds, status, temporalStatus }, 'Fetching promos with filters')

  const offset = (page - 1) * pageSize
  const limit = pageSize > 0 ? pageSize : undefined

  const cacheKey = cacheKeys.promos({ page, pageSize, status, temporalStatus, productsIds: productIds })

  const cachedPromos = await getCacheData(fastify, cacheKey, promoSchema.array())

  if (cachedPromos) {
    fastify.log.info(`Cache hit for promos with key: ${cacheKey}`)
    return cachedPromos
  }

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

  const _promos = promos.map((promo) => {
    let temporalStatus
    if (promo.startDate > now) {
      temporalStatus = TemporalStatus.UPCOMING
    } else if (promo.endDate < now) {
      temporalStatus = TemporalStatus.EXPIRED
    } else {
      temporalStatus = TemporalStatus.ACTIVE
    }

    return { ...promo, temporalStatus }
  })

  await fastify.redis.set(cacheKey, JSON.stringify(_promos), 'EX', 10)

  return _promos
}
