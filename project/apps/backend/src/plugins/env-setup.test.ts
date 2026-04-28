import { createLogger, envStepupPlugin } from './env-setup.js'

describe('createLogger', () => {
  it('uses debug as default log level', () => {
    const logger = createLogger({ isDev: false })

    expect(logger.level).toBe('debug')
  })

  it('uses the provided log level', () => {
    const logger = createLogger({ level: 'error', isDev: false })

    expect(logger.level).toBe('error')
  })
})

describe('envStepupPlugin', () => {
  it('registers @fastify/env with schema and dotenv support', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await envStepupPlugin({ register } as any, {} as any)

    expect(register).toHaveBeenCalledTimes(1)

    const [plugin, options] = register.mock.calls[0]

    expect(typeof plugin).toBe('function')
    expect(options).toMatchObject({ dotenv: true })
    expect(options.schema.required).toEqual(
      expect.arrayContaining(['PORT', 'DATABASE_URL', 'CACHE_URL', 'RABBITMQ_URL', 'JWT_ACCESS_SECRET']),
    )
    expect(options.schema.properties.COOKIE_SECRET.default).toBe('secret')
  })
})
