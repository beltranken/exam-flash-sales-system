import { usersTable } from '@shared/db'
import { resolveUserService } from './resolve-user.service.js'

describe('resolveUserService', () => {
  it('returns existing user when found', async () => {
    const existingUser = { id: 1, email: 'user@example.com' }
    const findFirst = jest.fn().mockResolvedValue(existingUser)
    const insert = jest.fn()

    const fastify = {
      db: {
        query: {
          usersTable: {
            findFirst,
          },
        },
        insert,
      },
    } as any

    const result = await resolveUserService(fastify, 'user@example.com')

    expect(findFirst).toHaveBeenCalledWith({ where: { email: 'user@example.com' } })
    expect(insert).not.toHaveBeenCalled()
    expect(result).toEqual(existingUser)
  })

  it('creates and returns user when not found', async () => {
    const newUser = { id: 2, email: 'new@example.com' }
    const findFirst = jest.fn().mockResolvedValue(undefined)
    const returning = jest.fn().mockResolvedValue([newUser])
    const values = jest.fn().mockReturnValue({ returning })
    const insert = jest.fn().mockReturnValue({ values })

    const fastify = {
      db: {
        query: {
          usersTable: {
            findFirst,
          },
        },
        insert,
      },
    } as any

    const result = await resolveUserService(fastify, 'new@example.com')

    expect(insert).toHaveBeenCalledWith(usersTable)
    expect(values).toHaveBeenCalledWith({ email: 'new@example.com' })
    expect(returning).toHaveBeenCalledTimes(1)
    expect(result).toEqual(newUser)
  })

  it('throws when insert returns no user', async () => {
    const findFirst = jest.fn().mockResolvedValue(undefined)
    const returning = jest.fn().mockResolvedValue([])
    const values = jest.fn().mockReturnValue({ returning })
    const insert = jest.fn().mockReturnValue({ values })

    const fastify = {
      db: {
        query: {
          usersTable: {
            findFirst,
          },
        },
        insert,
      },
    } as any

    await expect(resolveUserService(fastify, 'failed@example.com')).rejects.toThrow('Unable to create new user')
  })
})
