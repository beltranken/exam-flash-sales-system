import OrderPage from '@/pages/OrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order/$orderId')({
  component: OrderPage,
})
