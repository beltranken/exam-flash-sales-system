# Backend

## Checkout Endpoint

- generate UUID for orderID
- redis.decr(`product:${productID}:stock`)
- if stock < 0,
  - redis.incr(`product:${productID}:stock`) to revert
  - return out of stock error
- else
  - redis.set(`order:${orderID}:status`, "soft-reserved", "EX", ORDER_RESERVATION_TTL)
  - emit mq messages
    - order.reservation-expired (delayed by ORDER_RESERVATION_TTL)
    - order.reserved

# Consumers

## order.reserved

- if redis.get(`order:${orderID}:status`) is not "soft-reserved":
  - transaction rollback
  - do nothing else
- transaction start
  - update product_stocks
  - create order with status "reserved"
  - redis.set(`order:${orderID}:status`, "reserved", "EX", ORDER_PAYMENT_TTL)
  - email.send to user about reservation
  - report.order.reserved
- if fails in any stage
  - send report.order.cancelled
  - redis.incr(`product:${productID}:stock`) to release reserved stock
  - redis.del(`order:${orderID}:status`)
  - send email to user about failure

## order.cancelled

## order.reservation-expired

- if order does not exists or status is 'cancelled' or 'submitted', do nothing else
- if order status is 'submitted' or 'reserved', or payment is not yet completed
- if yes,
  - update order(if exists) status to "cancelled"
  - redis.incr(`product:${productID}:stock`) to release reserved stock
  - if status is 'submitted'
    - update product_stocks to release reserved stock
    - update order status to "cancelled"
    - if payment exists, update payment status to "refunded"
    - send email to user about cancellation
  - else if no, do nothing else

  - send report.order.cancelled

- if no, continue below
