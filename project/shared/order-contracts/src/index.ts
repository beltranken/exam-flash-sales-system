export * from './schemas.js'

export const OrderFailureReasons = {
  unknownMessageFormat: 'UNKNOWN_MESSAGE_FORMAT',
  reservationFailed: 'RESERVATION_FAILED',
  reservationTimeOut: 'RESERVATION_TIMEOUT',
} as const

export const PaymentFailureReasons = {
  paymentFailed: 'PAYMENT_FAILED',
  paymentTimeout: 'PAYMENT_TIMEOUT',
} as const

export const OrderQueueNames = {
  reserved: 'order.reserved',
  submitted: 'order.submitted',
  failed: 'order.failed',
  timeoutDelay: 'order.timeout.delay',
} as const

export const PaymentQueueNames = {
  made: 'payment.made',
  failed: 'payment.failed',
  confirmed: 'payment.confirmed',
  timeoutDelay: 'payment.timeout.delay',
} as const

export const orderTimeoutTtlMs = 15 * 60 * 1000 // 15 minutes

export const paymentTimeoutTtlMs = 5 * 60 * 1000 // 5 minutes
