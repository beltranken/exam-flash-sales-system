import {} from 'http-errors'
import z from 'zod/v4'

export const errorResponseSchema = z.object({
  message: z.string().optional(),
})

z.globalRegistry.add(errorResponseSchema, { id: 'ErrorResponse' })

export type ErrorResponse = z.infer<typeof errorResponseSchema>

export const errorResponses = {
  400: errorResponseSchema.describe('Bad Request'),
  401: errorResponseSchema.describe('Unauthorized'),
  403: errorResponseSchema.describe('Forbidden'),
  409: errorResponseSchema.describe('Conflict'),
  500: errorResponseSchema.describe('Internal Server Error'),
} as const
