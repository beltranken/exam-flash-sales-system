import { userSchema } from '@shared/db'
import { z } from 'zod/v4'

export const emailSignInRequestSchema = userSchema.pick({ email: true })
export type EmailSignInRequest = z.infer<typeof emailSignInRequestSchema>

export const signInChallengeResponseSchema = z.object({
  challengeId: z.uuid({ version: 'v4' }),
})
export type SignInChallengeResponse = z.infer<typeof signInChallengeResponseSchema>

export const signInConfirmRequestSchema = z.object({
  challengeId: z.uuid({ version: 'v4' }),
  otp: z.string().min(6).max(6),
})
export type SignInConfirmRequest = z.infer<typeof signInConfirmRequestSchema>

export const signInConfirmResponseSchema = z
  .object({ token: z.string() })
  .extend(userSchema.pick({ id: true, email: true }).shape)
export type SignInConfirmResponse = z.infer<typeof signInConfirmResponseSchema>
