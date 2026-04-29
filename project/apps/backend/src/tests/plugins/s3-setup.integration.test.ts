import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import Fastify from 'fastify'
import { s3Plugin } from '../../plugins/s3-setup.js'

jest.mock('@aws-sdk/client-s3', () => ({
  __esModule: true,
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn(),
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  __esModule: true,
  getSignedUrl: jest.fn(),
}))

describe('s3Plugin integration', () => {
  it('returns mock url when s3 config is missing', async () => {
    const app = Fastify()
    app.decorate('config', {} as any)

    try {
      await app.register(s3Plugin)

      const url = await app.s3!.signUrl('avatar.png')

      expect(url).toContain('picsum.photos')
    } finally {
      await app.close()
    }
  })

  it('creates S3 client and signs url when fully configured', async () => {
    const s3ClientInstance = { kind: 'client' }
    const signedUrl = 'https://signed-url.example.com'

    const S3ClientMock = S3Client as unknown as jest.Mock
    const GetObjectCommandMock = GetObjectCommand as unknown as jest.Mock
    const getSignedUrlMock = getSignedUrl as unknown as jest.Mock

    S3ClientMock.mockReturnValue(s3ClientInstance)
    GetObjectCommandMock.mockImplementation((input) => ({ input }))
    getSignedUrlMock.mockResolvedValue(signedUrl)

    const app = Fastify()
    app.decorate('config', {
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'key',
      AWS_SECRET_ACCESS_KEY: 'secret',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_BUCKET_NAME: 'uploads',
    } as any)

    try {
      await app.register(s3Plugin)

      const url = await app.s3!.signUrl('avatar.png')

      expect(S3ClientMock).toHaveBeenCalledTimes(1)
      expect(getSignedUrlMock).toHaveBeenCalledTimes(1)
      expect(getSignedUrlMock.mock.calls[0][0]).toBe(s3ClientInstance)
      expect(getSignedUrlMock.mock.calls[0][2]).toEqual({ expiresIn: 3600 })
      expect(url).toBe(signedUrl)
    } finally {
      await app.close()
      S3ClientMock.mockClear()
      GetObjectCommandMock.mockClear()
      getSignedUrlMock.mockClear()
    }
  })
})
