import { createLogger, envSetupPlugin } from './env-setup.js'

describe('createLogger', () => {
  it('uses info as default log level', () => {
    const logger = createLogger({ isDev: false })

    expect(logger.level).toBe('info')
  })

  it('uses the provided log level', () => {
    const logger = createLogger({ level: 'error', isDev: false })

    expect(logger.level).toBe('error')
  })
})

describe('envSetupPlugin', () => {
  it('registers @fastify/env with schema and dotenv support', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await envSetupPlugin({ register } as any, {} as any)

    expect(register).toHaveBeenCalledTimes(1)

    const [plugin, options] = register.mock.calls[0]

    expect(typeof plugin).toBe('function')
    expect(options).toMatchObject({ dotenv: true })
    expect(options.schema.required).toEqual(
      expect.arrayContaining(['PORT', 'DATABASE_URL', 'CACHE_URL', 'RABBITMQ_URL', 'JWT_ACCESS_SECRET']),
    )
    expect(options.schema.properties.COOKIE_SECRET.default).toBe('secret')
    expect(options.schema.properties.PINO_LOG_LEVEL).toMatchObject({
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
    })
    expect(options.schema.properties.PAYMENT_METHODS).toMatchObject({
      type: 'string',
      separator: ',',
      default: 'Skip Payment,Stripe',
    })
  })
})
