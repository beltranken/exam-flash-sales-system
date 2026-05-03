export const env = {
  rabbitMqUrl: process.env.RABBITMQ_URL!,
  orderQueuePrefetch: Number(process.env.ORDER_QUEUE_PREFETCH ?? 10),
}
