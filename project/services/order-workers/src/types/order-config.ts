import { ZodError } from 'zod'

export type OrderQueueConfig<T = unknown, E extends Error = Error> = {
  name: string
  handler: (message: T) => Promise<void>
  validate: (message: unknown) => T
  prepareValidationError: (error: ZodError, message: unknown) => E
}

export type RunnableOrderQueueConfig = {
  name: string
  process: (message: unknown) => Promise<void>
}
