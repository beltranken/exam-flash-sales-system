import { env } from '../config/env.js'

export const orderQueueNames = {
  reserved: env.orderReservedQueueName,
  submitted: env.orderSubmittedQueueName,
  failed: env.orderFailedQueueName,
}
