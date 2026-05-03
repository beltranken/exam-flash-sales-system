import { getMyOrderStatus } from '@/api'
import Alert from '@/components/base/Alert'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from 'flowbite-react'
import Payment from './Payment'

interface CheckoutWaitProps {
  orderId: string
  onFailed: () => void
  onCancel: () => void
  onCancelPayment: () => void
  onPaymentSuccess: () => void
  paymentMethod: string
}

export default function CheckoutWait({
  orderId,
  onFailed,
  onCancel,
  onCancelPayment,
  paymentMethod,
  onPaymentSuccess,
}: Readonly<CheckoutWaitProps>) {
  const {
    data: errorStatus,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      const response = await getMyOrderStatus({
        path: {
          orderId,
        },
      })

      if (response.error || !response.data) {
        throw new Error(response.error?.message)
      }

      return response.data
    },
    refetchInterval: (query) => {
      if (query.state.status === 'error') {
        return false
      }

      return 5000
    },
  })

  if (isError && !isLoading) {
    // handle 404 or 401
    return <Alert message={error?.message || 'An error occurred'} onClose={onFailed} />
  } else if (isLoading || errorStatus === 'pending') {
    // Still polling
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 py-20">
        <Spinner size="xl" />
        <span className="text-xl text-gray-500">Processing your order...</span>
      </div>
    )
  } else if (errorStatus === 'cancelled') {
    return <Alert message="Your order has been cancelled." onClose={onCancel} />
  } else if (errorStatus === 'submitted') {
    return (
      <Payment orderId={orderId} paymentMethod={paymentMethod} onClose={onCancelPayment} onSuccess={onPaymentSuccess} />
    )
  }

  return null
}
