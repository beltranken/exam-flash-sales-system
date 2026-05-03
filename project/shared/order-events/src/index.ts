export * from './schemas.js'

export const orderFailureReasons = {
  reservationFailed: 'RESERVATION_FAILED',
  reservationTimeOut: 'RESERVATION_TIMEOUT',
  paymentFailed: 'PAYMENT_FAILED',
  paymentTimeout: 'PAYMENT_TIMEOUT',
} as const

export const OrderQueueNames = {
  reserved: 'order.reserved',
  submitted: 'order.submitted',
  failed: 'order.failed',
  timeoutDelay: 'order.timeout.delay',
} as const

export const orderTimeoutTtlMs = 15 * 60 * 1000
