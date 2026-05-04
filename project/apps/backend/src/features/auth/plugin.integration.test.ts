import { buildFeaturePluginApp } from '../../tests/build-feature-plugin-app.js'
import { generateAndSaveOTPService } from './services/generate-otp.service.js'
import { getUser } from './services/get-user.service.js'
import { processAccessToken } from './services/process-access-token.service.js'
import { processRefreshToken } from './services/process-refresh-token.service.js'
import { resolveUserService } from './services/index.js'
import { verifyOTPService } from './services/verify-otp.service.js'
import { authPlugin } from './plugin.js'

jest.mock('./services/generate-otp.service.js', () => ({
  generateAndSaveOTPService: jest.fn(),
}))

jest.mock('./services/get-user.service.js', () => ({
  getUser: jest.fn(),
}))

jest.mock('./services/process-access-token.service.js', () => ({
  processAccessToken: jest.fn(),
}))

jest.mock('./services/process-refresh-token.service.js', () => ({
  processRefreshToken: jest.fn(),
}))

jest.mock('./services/index.js', () => ({
  resolveUserService: jest.fn(),
}))

jest.mock('./services/verify-otp.service.js', () => ({
  verifyOTPService: jest.fn(),
}))

describe('authPlugin integration', () => {
  it('registers sign-in route', async () => {
    const app = await buildFeaturePluginApp()
    ;(resolveUserService as jest.Mock).mockResolvedValue({ id: 42, email: 'user@example.com' })
    ;(generateAndSaveOTPService as jest.Mock).mockResolvedValue({
      challengeId: '11111111-1111-4111-8111-111111111111',
      otp: '123456',
    })

    try {
      await app.register(authPlugin, { prefix: '/api/auth' })
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { email: 'user@example.com' },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ challengeId: '11111111-1111-4111-8111-111111111111' })
      expect(app.redis.set).toHaveBeenCalledWith('user:42:email', 'user@example.com', 'EX', 300)
    } finally {
      await app.close()
    }
  })

  it('registers sign-in confirmation route and sets refresh cookie', async () => {
    const app = await buildFeaturePluginApp()
    ;(verifyOTPService as jest.Mock).mockResolvedValue({ id: 42, email: 'user@example.com' })
    ;(processAccessToken as jest.Mock).mockResolvedValue({ token: 'access-token' })
    ;(processRefreshToken as jest.Mock).mockResolvedValue({ token: 'refresh-token', jwtRefreshExpiryMs: 300000 })

    try {
      await app.register(authPlugin, { prefix: '/api/auth' })
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in/confirm',
        payload: {
          challengeId: '11111111-1111-4111-8111-111111111111',
          otp: '123456',
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ token: 'access-token', id: 42, email: 'user@example.com' })
      expect(response.cookies.find((cookie) => cookie.name === 'refresh_token')?.value).toBe('refresh-token')
    } finally {
      await app.close()
    }
  })

  it('registers refresh and sign-out routes', async () => {
    const app = await buildFeaturePluginApp()
    app.jwt.verify = jest.fn().mockResolvedValue({ userId: 42, email: 'user@example.com' })
    ;(getUser as jest.Mock).mockResolvedValue({ id: 42, email: 'user@example.com' })
    ;(processAccessToken as jest.Mock).mockResolvedValue({ token: 'new-access-token' })
    ;(processRefreshToken as jest.Mock).mockResolvedValue({ token: 'new-refresh-token', jwtRefreshExpiryMs: 300000 })

    try {
      await app.register(authPlugin, { prefix: '/api/auth' })
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: { refreshToken: 'old-refresh-token' },
      })
      const signOutResponse = await app.inject({ method: 'POST', url: '/api/auth/sign-out' })

      expect(refreshResponse.statusCode).toBe(200)
      expect(refreshResponse.json()).toEqual({ token: 'new-access-token', id: 42, email: 'user@example.com' })
      expect(signOutResponse.statusCode).toBe(204)
    } finally {
      await app.close()
    }
  })
})
