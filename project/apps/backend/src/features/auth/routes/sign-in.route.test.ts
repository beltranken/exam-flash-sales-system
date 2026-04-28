import { generateAndSaveOTPService } from '../services/generate-otp.service.js'
import { resolveUserService } from '../services/index.js'
import { signInRoute } from './sign-in.route.js'

jest.mock('../services/generate-otp.service.js', () => ({
  generateAndSaveOTPService: jest.fn(),
}))

jest.mock('../services/index.js', () => ({
  resolveUserService: jest.fn(),
}))

describe('signInRoute', () => {
  it('resolves user, creates OTP challenge, and returns challengeId', async () => {
    const resolveUserServiceMock = resolveUserService as jest.MockedFunction<typeof resolveUserService>
    const generateAndSaveOTPServiceMock = generateAndSaveOTPService as jest.MockedFunction<
      typeof generateAndSaveOTPService
    >

    resolveUserServiceMock.mockResolvedValue({ id: 42, email: 'user@example.com' } as any)
    generateAndSaveOTPServiceMock.mockResolvedValue({ otp: '123456', challengeId: 'challenge-1' })

    const status = jest.fn().mockReturnThis()
    const send = jest.fn()
    const reply = { status, send } as any
    const req = { body: { email: 'user@example.com' } } as any
    const fastify = {} as any

    const handler = signInRoute(fastify)
    await handler(req, reply)

    expect(resolveUserServiceMock).toHaveBeenCalledWith(fastify, 'user@example.com')
    expect(generateAndSaveOTPServiceMock).toHaveBeenCalledWith(fastify, 42)
    expect(status).toHaveBeenCalledWith(200)
    expect(send).toHaveBeenCalledWith({ challengeId: 'challenge-1' })
  })
})
