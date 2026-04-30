import { EmailSignInRequest, SignInChallengeResponse } from '@types'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { generateAndSaveOTPService } from '../services/generate-otp.service.js'
import { resolveUserService } from '../services/index.js'

export type SignInRoute = {
  Body: EmailSignInRequest
  Reply: SignInChallengeResponse
}

export function signInRoute(fastify: FastifyInstance) {
  return async function (req: FastifyRequest<SignInRoute>, reply: FastifyReply<SignInRoute>) {
    const { email } = req.body
    const user = await resolveUserService(fastify, email)
    const { challengeId } = await generateAndSaveOTPService(fastify, user.id)

    fastify.redis.set(`user:${user.id}:email`, email, 'EX', 5 * 60)

    reply.status(200).send({ challengeId })
  }
}
