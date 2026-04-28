import { authenticate, handleJwtVerifyError } from './auth-setup.js'

describe('handleJwtVerifyError', () => {
  it('rethrows non-Error values', () => {
    expect(() => handleJwtVerifyError('bad-token')).toThrow('bad-token')
  })

  it('throws Unauthorized for JsonWebTokenError', () => {
    const err = new Error('bad token')
    err.name = 'JsonWebTokenError'

    expect(() => handleJwtVerifyError(err)).toThrow('Unable to decode jwt')
  })

  it('throws Unauthorized for TokenExpiredError', () => {
    const err = new Error('expired token')
    err.name = 'TokenExpiredError'

    expect(() => handleJwtVerifyError(err)).toThrow('Access token is expired')
  })

  it('rethrows unknown Error values', () => {
    const err = new Error('unexpected')

    expect(() => handleJwtVerifyError(err)).toThrow(err)
  })
})

describe('authenticate', () => {
  it('calls jwtVerify on request', async () => {
    const jwtVerify = jest.fn().mockResolvedValue(undefined)

    await authenticate({ jwtVerify } as any)

    expect(jwtVerify).toHaveBeenCalledTimes(1)
  })

  it('maps jwt verify errors through handler', async () => {
    const err = new Error('expired token')
    err.name = 'TokenExpiredError'
    const jwtVerify = jest.fn().mockRejectedValue(err)

    await expect(authenticate({ jwtVerify } as any)).rejects.toThrow('Access token is expired')
  })
})
