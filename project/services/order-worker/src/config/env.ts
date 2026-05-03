import 'dotenv/config'

export const env = {
  rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  orderQueueName: process.env.ORDER_QUEUE_NAME ?? 'orders.created',
  orderQueuePrefetch: Number(process.env.ORDER_QUEUE_PREFETCH ?? 10),
}
