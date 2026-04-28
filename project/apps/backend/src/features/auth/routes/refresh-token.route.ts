import { RefreshTokenRequestBody, SignInConfirmResponse } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { BadRequest } from 'http-errors'
import { getUser } from '../services/get-user.js'
import { processAccessToken } from '../services/process-access-token.js'
import { processRefreshToken } from '../services/process-refresh-token.js'

type RefreshRoute = {
  Body: RefreshTokenRequestBody
  Reply: SignInConfirmResponse
}

export function refreshTokenRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<RefreshRoute>, reply: FastifyReply<RefreshRoute>) {
    let refreshToken: string
    if (req.cookies.refresh_token) {
      refreshToken = req.cookies.refresh_token
    } else if (req.body.refreshToken) {
      refreshToken = req.body.refreshToken
    } else {
      throw new BadRequest('Refresh token is required')
    }

    try {
      const { userId } = await fastify.jwt.verify<{
        userId: number
        email: string
      }>(refreshToken)

      const result = await getUser(fastify, userId)

      const accessData = await processAccessToken(reply, {
        userId: result.id,
        email: result.email,
      })

      // Rotate refresh token
      const refreshData = await processRefreshToken(reply, {
        userId: result.id,
        email: result.email,
      })

      reply.setCookie('refresh_token', refreshData.token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: refreshData.jwtRefreshExpiryMs / 1000,
      })

      reply.status(200).send({ token: accessData.token, id: result.id, email: result.email })
    } catch (err) {}
  }
}
