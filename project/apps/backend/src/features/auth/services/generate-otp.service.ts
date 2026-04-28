import { generateOTP, hashOtp } from '@utils'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

export type ChallengeData = {
  userId: number
  hashedOtp: string
  attempts: number
  createdAt: string
}

export async function generateAndSaveOTPService(
  fastify: FastifyInstance,
  userId: number,
): Promise<{ otp: string; challengeId: string }> {
  const otp = generateOTP()
  const hashedOtp = hashOtp(otp)
  const challengeId = randomUUID()

  const challengeData: ChallengeData = {
    userId,
    hashedOtp,
    attempts: 0,
    createdAt: new Date().toISOString(),
  }

  await fastify.redis.set(`challenge:${challengeId}`, JSON.stringify(challengeData), 'EX', 5 * 60)

  return { otp, challengeId }
}
