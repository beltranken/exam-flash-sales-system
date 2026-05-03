import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order/$orderId')({
  component: () => <div>Hello "/order/$orderId"!</div>,
})
