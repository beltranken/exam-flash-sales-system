import { User } from '@shared/db'
import { hashOtp } from '@utils'
import { FastifyInstance } from 'fastify'
import createHttpError from 'http-errors'
import type { ChallengeData } from './generate-otp.service.js'
import { getUser } from './get-user.service.js'

const MAX_ATTEMPTS = 5

export async function verifyOTPService(fastify: FastifyInstance, challengeId: string, otp: string): Promise<User> {
  const challengeDataRaw = await fastify.redis.get(`challenge:${challengeId}`)

  if (!challengeDataRaw) {
    throw new createHttpError.Unauthorized('Challenge not found or expired')
  }

  const challengeData: ChallengeData = JSON.parse(challengeDataRaw)

  if (challengeData.attempts >= MAX_ATTEMPTS) {
    await fastify.redis.del(`challenge:${challengeId}`)
    throw new createHttpError.Unauthorized('Too many attempts. Challenge revoked')
  }

  const hashedInput = hashOtp(otp)

  // if SKIP_LOGIN is true, we skip OTP verification for easier testing
  if (!fastify.config.SKIP_LOGIN && hashedInput !== challengeData.hashedOtp) {
    challengeData.attempts += 1
    await fastify.redis.set(`challenge:${challengeId}`, JSON.stringify(challengeData), 'EX', 5 * 60)
    throw new createHttpError.Unauthorized('Invalid OTP')
  }

  await fastify.redis.del(`challenge:${challengeId}`)

  return await getUser(fastify, challengeData.userId)
}
