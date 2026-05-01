import z from 'zod/v4'

export const refreshTokenRequestBodySchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenRequestBody = z.infer<typeof refreshTokenRequestBodySchema>
