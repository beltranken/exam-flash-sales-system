import 'dotenv/config'

export const env = {
  rabbitMqUrl: process.env.RABBITMQ_URL!,
  orderReservedQueueName: process.env.ORDER_RESERVED_QUEUE_NAME ?? 'order.reserved',
  orderSubmittedQueueName: process.env.ORDER_SUBMITTED_QUEUE_NAME ?? 'order.submitted',
  orderFailedQueueName: process.env.ORDER_FAILED_QUEUE_NAME ?? 'order.failed',
  orderQueuePrefetch: Number(process.env.ORDER_QUEUE_PREFETCH ?? 10),
}
