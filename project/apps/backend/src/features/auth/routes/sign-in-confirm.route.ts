import { SignInConfirmRequest, SignInConfirmResponse } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { processAccessToken } from '../services/process-access-token.service.js'
import { processRefreshToken } from '../services/process-refresh-token.service.js'
import { verifyOTPService } from '../services/verify-otp.service.js'

export type SignInConfirmRoute = {
  Body: SignInConfirmRequest
  Reply: SignInConfirmResponse
}

export function signInConfirmRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<SignInConfirmRoute>, reply: FastifyReply<SignInConfirmRoute>) {
    const { challengeId, otp } = req.body
    const user = await verifyOTPService(fastify, challengeId, otp)

    const { token } = await processAccessToken(reply, { userId: user.id, email: user.email })
    const { token: refreshToken, jwtRefreshExpiryMs } = await processRefreshToken(reply, {
      userId: user.id,
      email: user.email,
    })

    reply.setCookie('refresh_token', refreshToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: jwtRefreshExpiryMs / 1000,
    })

    reply.status(200).send({ token, id: user.id, email: user.email })
  }
}
