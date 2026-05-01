import { corsSetupPlugin } from './cors-setup.js'

const runOrigin = (origin: string | undefined, originFn: jest.Mock) => {
  return new Promise<{
    err: Error | null
    allowed: boolean
  }>((resolve) => {
    originFn(origin, (err: Error | null, allowed: boolean) => {
      resolve({ err, allowed })
    })
  })
}

const createFastifyMock = (register: jest.Mock, errorLogger = jest.fn()) => {
  return { register, log: { error: errorLogger } } as any
}

describe('corsSetupPlugin', () => {
  it('registers cors and allows requests with no origin', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await corsSetupPlugin(createFastifyMock(register), {})

    expect(register).toHaveBeenCalledTimes(1)

    const [, options] = register.mock.calls[0]
    const result = await runOrigin(undefined, options.origin)

    expect(options.credentials).toBe(true)
    expect(result).toEqual({ err: null, allowed: true })
  })

  it('allows localhost origin', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await corsSetupPlugin(createFastifyMock(register), {})

    const [, options] = register.mock.calls[0]
    const result = await runOrigin('http://localhost:5173', options.origin)

    expect(result).toEqual({ err: null, allowed: true })
  })

  it('allows loopback ip origin', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await corsSetupPlugin(createFastifyMock(register), {})

    const [, options] = register.mock.calls[0]
    const result = await runOrigin('http://127.0.0.1:5173', options.origin)

    expect(result).toEqual({ err: null, allowed: true })
  })

  it('rejects non-localhost origin', async () => {
    const register = jest.fn().mockResolvedValue(undefined)

    await corsSetupPlugin(createFastifyMock(register), {})

    const [, options] = register.mock.calls[0]
    const result = await runOrigin('https://example.com', options.origin)

    expect(result.err).toBeInstanceOf(Error)
    expect(result.err?.message).toBe('Not allowed')
    expect(result.allowed).toBe(false)
  })

  it('logs and rejects invalid origin values', async () => {
    const register = jest.fn().mockResolvedValue(undefined)
    const logError = jest.fn()

    await corsSetupPlugin(createFastifyMock(register, logError), {})

    const [, options] = register.mock.calls[0]
    const result = await runOrigin('::not-a-url::', options.origin)

    expect(logError).toHaveBeenCalledTimes(1)
    expect(result.err).toBeInstanceOf(Error)
    expect(result.allowed).toBe(false)
  })
})
