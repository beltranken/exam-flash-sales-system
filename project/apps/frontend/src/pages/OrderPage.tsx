import { getMyOrderById } from '@shared/api-client'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Button } from 'flowbite-react'

const orderRouteApi = getRouteApi('/order/$orderId')

export default function OrderPage() {
  const { orderId } = orderRouteApi.useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await getMyOrderById({
        path: {
          orderId,
        },
      })

      if (!response.data && response.error) {
        throw new Error(response.error.message || 'Failed to fetch order')
      }

      return response.data
    },
  })

  let innerContent
  if (isLoading) {
    innerContent = <p className="text-center text-gray-500">Loading...</p>
  } else if (!data || error) {
    innerContent = <p className="text-center text-gray-500">{error ? error.message : 'Order not found'}</p>
  } else {
    const totalOrderAmount = data.totalAmountInCents
    const totalPayment = data.payments?.reduce((accu, payment) => accu + payment.amountInCents, 0) ?? 0
    const canPay = data.status === 'submitted' && totalPayment < totalOrderAmount

    innerContent = (
      <div className="w-full overflow-y-auto">
        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>

        {canPay && <Button>Complete the Payment</Button>}
      </div>
    )
  }

  return <div className="w-full">{innerContent}</div>
}
