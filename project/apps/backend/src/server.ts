import { createApp } from './app.js'

const main = async () => {
  const fastify = await createApp()
  const port = Number(fastify.config.PORT)

  ;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, shutting down...`)
      try {
        await fastify.close()
        process.exit(0)
      } catch (err) {
        fastify.log.error(`Error during shutdown: ${err}`)
        process.exit(1)
      }
    })
  })

  try {
    fastify.listen({ port }, () => {
      fastify.log.info(`Listening on ${port}...`)
    })
  } catch (error) {
    fastify.log.error(`startup error: ${error}`)
    process.exit(1)
  }
}

main()
