import { ZodError } from 'zod'

export type QueueConfig<T = unknown, E extends Error = Error> = {
  name: string
  handler: (message: T) => Promise<void>
  validate: (message: unknown) => T
  prepareValidationError: (error: ZodError, message: unknown) => E
}

export type RunnableQueueConfig = {
  name: string
  process: (message: unknown) => Promise<void>
}
