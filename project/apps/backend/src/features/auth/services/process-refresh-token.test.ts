import { processRefreshToken } from './process-refresh-token.js'

describe('processRefreshToken', () => {
  it('signs refresh token with seven day expiry', async () => {
    const jwtSign = jest.fn().mockResolvedValue('refresh-token')
    const reply = { jwtSign } as any

    const result = await processRefreshToken(reply, {
      userId: 7,
      email: 'user@example.com',
    })

    expect(jwtSign).toHaveBeenCalledTimes(1)
    expect(jwtSign).toHaveBeenCalledWith({ userId: 7, email: 'user@example.com' }, { expiresIn: 604800 })
    expect(result).toEqual({
      token: 'refresh-token',
      jwtRefreshExpiryMs: 604800000,
    })
  })
})
