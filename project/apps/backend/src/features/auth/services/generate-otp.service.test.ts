import { generateOTP, hashOtp } from '@utils'
import { randomUUID } from 'crypto'
import { generateAndSaveOTPService } from './generate-otp.service.js'

jest.mock('@utils', () => ({
  generateOTP: jest.fn(),
  hashOtp: jest.fn(),
}))

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto')
  return {
    ...actual,
    randomUUID: jest.fn(),
  }
})

describe('generateAndSaveOTPService', () => {
  it('generates otp, stores challenge in redis, and returns otp/challengeId', async () => {
    const generateOTPMock = generateOTP as jest.MockedFunction<typeof generateOTP>
    const hashOtpMock = hashOtp as jest.MockedFunction<typeof hashOtp>
    const randomUUIDMock = randomUUID as jest.MockedFunction<typeof randomUUID>

    generateOTPMock.mockReturnValue('123456')
    hashOtpMock.mockReturnValue('hashed-otp')
    randomUUIDMock.mockReturnValue('11111111-1111-1111-1111-111111111111')

    const set = jest.fn().mockResolvedValue('OK')
    const fastify = { redis: { set } } as any

    const result = await generateAndSaveOTPService(fastify, 7)

    expect(generateOTPMock).toHaveBeenCalledTimes(1)
    expect(hashOtpMock).toHaveBeenCalledWith('123456')
    expect(randomUUIDMock).toHaveBeenCalledTimes(1)

    expect(set).toHaveBeenCalledTimes(1)
    expect(set).toHaveBeenCalledWith('challenge:11111111-1111-1111-1111-111111111111', expect.any(String), 'EX', 300)

    const [, rawPayload] = set.mock.calls[0]
    const payload = JSON.parse(rawPayload)
    expect(payload).toEqual(
      expect.objectContaining({
        userId: 7,
        hashedOtp: 'hashed-otp',
        attempts: 0,
      }),
    )
    expect(typeof payload.createdAt).toBe('string')

    expect(result).toEqual({ otp: '123456', challengeId: '11111111-1111-1111-1111-111111111111' })
  })
})
