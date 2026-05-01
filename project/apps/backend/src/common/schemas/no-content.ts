import z from 'zod/v4'

export const noContentResponseSchema = z.void().describe('No Content')

z.globalRegistry.add(noContentResponseSchema, { id: 'NoContentResponse' })

export const noContentResponse = {
  204: noContentResponseSchema,
} as const
