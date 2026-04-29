import { getUser } from './get-user.service.js'

describe('getUser', () => {
  it('returns user when found', async () => {
    const user = { id: 1, email: 'user@example.com' }
    const findFirst = jest.fn().mockResolvedValue(user)

    const fastify = {
      db: {
        query: {
          usersTable: {
            findFirst,
          },
        },
      },
    } as any

    await expect(getUser(fastify, 1)).resolves.toEqual(user)
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('throws unauthorized when user is missing', async () => {
    const findFirst = jest.fn().mockResolvedValue(undefined)

    const fastify = {
      db: {
        query: {
          usersTable: {
            findFirst,
          },
        },
      },
    } as any

    await expect(getUser(fastify, 99)).rejects.toThrow('User not found')
  })
})
