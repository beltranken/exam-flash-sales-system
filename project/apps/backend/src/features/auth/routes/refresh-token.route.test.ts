import { handleJwtVerifyError } from '../../../plugins/auth-setup.js'
import { getUser } from '../services/get-user.service.js'
import { processAccessToken } from '../services/process-access-token.service.js'
import { processRefreshToken } from '../services/process-refresh-token.service.js'
import { refreshTokenRoute } from './refresh-token.route.js'

jest.mock('../../../plugins/auth-setup.js', () => ({
  handleJwtVerifyError: jest.fn(),
}))

jest.mock('../services/get-user.service.js', () => ({
  getUser: jest.fn(),
}))

jest.mock('../services/process-access-token.service.js', () => ({
  processAccessToken: jest.fn(),
}))

jest.mock('../services/process-refresh-token.service.js', () => ({
  processRefreshToken: jest.fn(),
}))

describe('refreshTokenRoute', () => {
  it('uses cookie refresh token, rotates token, and responds with access payload', async () => {
    const getUserMock = getUser as jest.MockedFunction<typeof getUser>
    const processAccessTokenMock = processAccessToken as jest.MockedFunction<typeof processAccessToken>
    const processRefreshTokenMock = processRefreshToken as jest.MockedFunction<typeof processRefreshToken>

    getUserMock.mockResolvedValue({ id: 9, email: 'user@example.com' } as any)
    processAccessTokenMock.mockResolvedValue({ token: 'access-token' })
    processRefreshTokenMock.mockResolvedValue({ token: 'refresh-token', jwtRefreshExpiryMs: 5000 })

    const verify = jest.fn().mockResolvedValue({ userId: 9, email: 'user@example.com' })
    const fastify = { jwt: { verify } } as any

    const setCookie = jest.fn().mockReturnThis()
    const status = jest.fn().mockReturnThis()
    const send = jest.fn()
    const reply = { setCookie, status, send } as any

    const req = {
      cookies: { refresh_token: 'cookie-token' },
      body: {},
    } as any

    const handler = refreshTokenRoute(fastify)
    await handler(req, reply)

    expect(verify).toHaveBeenCalledWith('cookie-token')
    expect(getUserMock).toHaveBeenCalledWith(fastify, 9)
    expect(setCookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 5,
    })
    expect(status).toHaveBeenCalledWith(200)
    expect(send).toHaveBeenCalledWith({ token: 'access-token', id: 9, email: 'user@example.com' })
  })

  it('uses body refresh token when cookie is missing', async () => {
    const getUserMock = getUser as jest.MockedFunction<typeof getUser>
    const processAccessTokenMock = processAccessToken as jest.MockedFunction<typeof processAccessToken>
    const processRefreshTokenMock = processRefreshToken as jest.MockedFunction<typeof processRefreshToken>

    getUserMock.mockResolvedValue({ id: 11, email: 'body@example.com' } as any)
    processAccessTokenMock.mockResolvedValue({ token: 'access-token' })
    processRefreshTokenMock.mockResolvedValue({ token: 'refresh-token', jwtRefreshExpiryMs: 8000 })

    const verify = jest.fn().mockResolvedValue({ userId: 11, email: 'body@example.com' })
    const fastify = { jwt: { verify } } as any
    const reply = {
      setCookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any

    const req = {
      cookies: {},
      body: { refreshToken: 'body-token' },
    } as any

    const handler = refreshTokenRoute(fastify)
    await handler(req, reply)

    expect(verify).toHaveBeenCalledWith('body-token')
  })

  it('throws when refresh token is missing from both cookie and body', async () => {
    const fastify = { jwt: { verify: jest.fn() } } as any
    const reply = {} as any
    const req = { cookies: {}, body: {} } as any

    const handler = refreshTokenRoute(fastify)

    await expect(handler(req, reply)).rejects.toThrow('Refresh token is required')
  })

  it('delegates jwt verify errors to handleJwtVerifyError', async () => {
    const handleJwtVerifyErrorMock = handleJwtVerifyError as jest.MockedFunction<typeof handleJwtVerifyError>
    const verifyError = new Error('bad token')
    const fastify = {
      jwt: {
        verify: jest.fn().mockRejectedValue(verifyError),
      },
    } as any

    const reply = {
      setCookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any

    const req = {
      cookies: { refresh_token: 'bad-token' },
      body: {},
    } as any

    const handler = refreshTokenRoute(fastify)
    await handler(req, reply)

    expect(handleJwtVerifyErrorMock).toHaveBeenCalledWith(verifyError)
  })
})
