import { processAccessToken } from '../services/process-access-token.service.js'
import { processRefreshToken } from '../services/process-refresh-token.service.js'
import { verifyOTPService } from '../services/verify-otp.service.js'
import { signInConfirmRoute } from './sign-in-confirm.route.js'

jest.mock('../services/process-access-token.js', () => ({
  processAccessToken: jest.fn(),
}))

jest.mock('../services/process-refresh-token.js', () => ({
  processRefreshToken: jest.fn(),
}))

jest.mock('../services/verify-otp.service.js', () => ({
  verifyOTPService: jest.fn(),
}))

describe('signInConfirmRoute', () => {
  it('verifies otp, issues tokens, sets refresh cookie, and returns auth payload', async () => {
    const verifyOTPServiceMock = verifyOTPService as jest.MockedFunction<typeof verifyOTPService>
    const processAccessTokenMock = processAccessToken as jest.MockedFunction<typeof processAccessToken>
    const processRefreshTokenMock = processRefreshToken as jest.MockedFunction<typeof processRefreshToken>

    verifyOTPServiceMock.mockResolvedValue({ id: 7, email: 'user@example.com' } as any)
    processAccessTokenMock.mockResolvedValue({ token: 'access-token' })
    processRefreshTokenMock.mockResolvedValue({
      token: 'refresh-token',
      jwtRefreshExpiryMs: 7000,
    })

    const setCookie = jest.fn().mockReturnThis()
    const status = jest.fn().mockReturnThis()
    const send = jest.fn()

    const reply = { setCookie, status, send } as any
    const req = { body: { challengeId: 'challenge-1', otp: '123456' } } as any
    const fastify = {} as any

    const handler = signInConfirmRoute(fastify)
    await handler(req, reply)

    expect(verifyOTPServiceMock).toHaveBeenCalledWith(fastify, 'challenge-1', '123456')
    expect(processAccessTokenMock).toHaveBeenCalledWith(reply, { userId: 7, email: 'user@example.com' })
    expect(processRefreshTokenMock).toHaveBeenCalledWith(reply, { userId: 7, email: 'user@example.com' })
    expect(setCookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7,
    })
    expect(status).toHaveBeenCalledWith(200)
    expect(send).toHaveBeenCalledWith({ token: 'access-token', id: 7, email: 'user@example.com' })
  })
})
