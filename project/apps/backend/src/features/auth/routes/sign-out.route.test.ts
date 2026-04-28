import { signOutRoute } from './sign-out.route.js'

describe('signOutRoute', () => {
  it('clears refresh cookie and returns 204', () => {
    const clearCookie = jest.fn().mockReturnThis()
    const status = jest.fn().mockReturnThis()
    const send = jest.fn()

    const reply = {
      clearCookie,
      status,
      send,
    } as any

    signOutRoute({} as any, reply)

    expect(clearCookie).toHaveBeenCalledWith('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
    expect(status).toHaveBeenCalledWith(204)
    expect(send).toHaveBeenCalledTimes(1)
  })
})
