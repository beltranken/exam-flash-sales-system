import z from 'zod/v4'

export const numberParamSchema = (key: string) =>
  z.object({
    [key]: z.coerce.number().int(),
  })
