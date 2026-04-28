import { FastifyReply } from 'fastify'
import ms from 'ms'

type ProcessAuthInput = {
  userId: number
  email: string
}

export async function processRefreshToken(reply: FastifyReply, { userId, email }: ProcessAuthInput) {
  const jwtRefreshExpiryMs = ms('7d')
  const token = await reply.jwtSign(
    { userId, email },
    {
      expiresIn: jwtRefreshExpiryMs / 1000,
    },
  )

  return {
    token,
    jwtRefreshExpiryMs,
  }
}
