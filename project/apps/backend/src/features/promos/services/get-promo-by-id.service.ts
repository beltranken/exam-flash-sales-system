import { Promo, PromoStatus } from '@shared/db'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'

export async function getPromoByIdService(fastify: FastifyInstance, promoId: Promo['id']) {
  const now = new Date()
  const promo = await fastify.db.query.promosTable.findFirst({
    where: {
      id: promoId,
      status: PromoStatus.ACTIVE,
      startDate: {
        lte: now,
      },
      endDate: {
        gte: now,
      },
    },
    with: {
      promoItems: true,
    },
  })

  if (!promo) {
    throw createHttpError.NotFound(`Promo with id ${promoId} not found`)
  }

  return promo
}
