import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const s3PluginImpl = async (fastify: FastifyInstance) => {
  fastify.log.info('Registering S3 plugin')

  let s3: S3Client | undefined

  if (
    fastify.config.AWS_REGION !== undefined &&
    fastify.config.AWS_ACCESS_KEY_ID !== undefined &&
    fastify.config.AWS_SECRET_ACCESS_KEY !== undefined &&
    fastify.config.S3_ENDPOINT !== undefined &&
    fastify.config.S3_BUCKET_NAME !== undefined
  ) {
    s3 = new S3Client({
      region: fastify.config.AWS_REGION,
      endpoint: fastify.config.S3_ENDPOINT,
      credentials: {
        accessKeyId: fastify.config.AWS_ACCESS_KEY_ID,
        secretAccessKey: fastify.config.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  fastify.decorate('s3', {
    signUrl: async (key: string): Promise<string | null> => {
      if (s3) {
        return await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: fastify.config.S3_BUCKET_NAME,
            Key: key,
          }),
          { expiresIn: 3600 },
        )
      }

      return null
    },
  })
}

export const s3Plugin = fp(s3PluginImpl, {
  name: 's3',
})
