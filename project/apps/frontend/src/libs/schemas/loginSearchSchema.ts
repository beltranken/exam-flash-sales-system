import { z } from 'zod/v4'

export const loginSearchSchema = z.object({
  login: z.union([z.string(), z.boolean()]).optional(),
})

export type LoginSearch = z.infer<typeof loginSearchSchema>
