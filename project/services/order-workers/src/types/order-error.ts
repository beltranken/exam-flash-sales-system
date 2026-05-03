import { OrderFailureReasons, OrderItem } from '@shared/order-contracts'

export type OrderErrorCode = (typeof OrderFailureReasons)[keyof typeof OrderFailureReasons]

interface OrderErrorArgs {
  message: string
  code: OrderErrorCode
  orderId?: string
  orderItems?: OrderItem[]
  cause?: unknown
}

export class OrderError extends Error {
  readonly code: OrderErrorCode
  readonly orderId?: string
  readonly orderItems?: OrderItem[]

  constructor(args: OrderErrorArgs) {
    super(args.message, { cause: args.cause })

    this.name = 'OrderError'
    this.code = args.code
    this.orderId = args.orderId
    this.orderItems = args.orderItems
  }
}
