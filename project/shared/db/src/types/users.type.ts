import { createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod/v4'
import { usersTable } from '../schemas/users.schema.js'
import { timeStampSchema } from './common.js'

export const userSchema = createSelectSchema(usersTable, {
  ...timeStampSchema.shape,
})
export type User = z.infer<typeof userSchema>
