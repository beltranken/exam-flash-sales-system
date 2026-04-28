import { hashOtp } from '@utils'
import { getUser } from './get-user.js'
import { verifyOTPService } from './verify-otp.service.js'

jest.mock('@utils', () => ({
  hashOtp: jest.fn(),
}))

jest.mock('./get-user.js', () => ({
  getUser: jest.fn(),
}))

describe('verifyOTPService', () => {
  it('throws when challenge does not exist', async () => {
    const get = jest.fn().mockResolvedValue(null)
    const fastify = { redis: { get } } as any

    await expect(verifyOTPService(fastify, 'missing', '123456')).rejects.toThrow('Challenge not found or expired')
  })

  it('revokes challenge when max attempts reached', async () => {
    const challenge = {
      userId: 10,
      hashedOtp: 'hash',
      attempts: 5,
      createdAt: new Date().toISOString(),
    }

    const get = jest.fn().mockResolvedValue(JSON.stringify(challenge))
    const del = jest.fn().mockResolvedValue(1)
    const fastify = { redis: { get, del } } as any

    await expect(verifyOTPService(fastify, 'challenge-1', '123456')).rejects.toThrow(
      'Too many attempts. Challenge revoked',
    )
    expect(del).toHaveBeenCalledWith('challenge:challenge-1')
  })

  it('increments attempts and throws when otp is invalid', async () => {
    const hashOtpMock = hashOtp as jest.MockedFunction<typeof hashOtp>
    hashOtpMock.mockReturnValue('wrong-hash')

    const challenge = {
      userId: 10,
      hashedOtp: 'expected-hash',
      attempts: 1,
      createdAt: new Date().toISOString(),
    }

    const get = jest.fn().mockResolvedValue(JSON.stringify(challenge))
    const set = jest.fn().mockResolvedValue('OK')
    const fastify = { redis: { get, set } } as any

    await expect(verifyOTPService(fastify, 'challenge-2', '123456')).rejects.toThrow('Invalid OTP')

    expect(set).toHaveBeenCalledWith('challenge:challenge-2', expect.any(String), 'EX', 300)

    const [, rawPayload] = set.mock.calls[0]
    const payload = JSON.parse(rawPayload)
    expect(payload.attempts).toBe(2)
  })

  it('deletes challenge and returns user when otp is valid', async () => {
    const hashOtpMock = hashOtp as jest.MockedFunction<typeof hashOtp>
    const getUserMock = getUser as jest.MockedFunction<typeof getUser>

    hashOtpMock.mockReturnValue('expected-hash')
    getUserMock.mockResolvedValue({ id: 10, email: 'user@example.com' } as any)

    const challenge = {
      userId: 10,
      hashedOtp: 'expected-hash',
      attempts: 0,
      createdAt: new Date().toISOString(),
    }

    const get = jest.fn().mockResolvedValue(JSON.stringify(challenge))
    const del = jest.fn().mockResolvedValue(1)
    const fastify = { redis: { get, del } } as any

    const result = await verifyOTPService(fastify, 'challenge-3', '123456')

    expect(del).toHaveBeenCalledWith('challenge:challenge-3')
    expect(getUserMock).toHaveBeenCalledWith(fastify, 10)
    expect(result).toEqual({ id: 10, email: 'user@example.com' })
  })
})
