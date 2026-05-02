import z from 'zod/v4'

export const pagingSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().optional(),
})

export type Paging = z.infer<typeof pagingSchema>

export const pagingRequestSchema = z.object({
  page: z.coerce.number().int().positive(),
  pageSize: z.coerce.number().int().positive().optional(),
})

export type PagingRequest = z.infer<typeof pagingRequestSchema>

export const timeStampSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type TimeStamp = z.infer<typeof timeStampSchema>
