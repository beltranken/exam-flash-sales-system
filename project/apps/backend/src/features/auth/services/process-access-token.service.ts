import { FastifyReply } from 'fastify'
import ms from 'ms'

type ProcessAuthInput = {
  userId: number
  email: string
}

export async function processAccessToken(reply: FastifyReply, { userId, email }: ProcessAuthInput) {
  const jwtAccessExpiryMs = ms('1m')
  const token = await reply.jwtSign(
    { userId, email },
    {
      expiresIn: jwtAccessExpiryMs / 1000,
    },
  )

  return {
    token,
  }
}
