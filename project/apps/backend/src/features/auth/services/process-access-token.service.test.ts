import { processAccessToken } from './process-access-token.service.js'

describe('processAccessToken', () => {
  it('signs access token with one minute expiry', async () => {
    const jwtSign = jest.fn().mockResolvedValue('access-token')
    const reply = { jwtSign } as any

    const result = await processAccessToken(reply, {
      userId: 7,
      email: 'user@example.com',
    })

    expect(jwtSign).toHaveBeenCalledTimes(1)
    expect(jwtSign).toHaveBeenCalledWith({ userId: 7, email: 'user@example.com' }, { expiresIn: 60 })
    expect(result).toEqual({ token: 'access-token' })
  })
})
