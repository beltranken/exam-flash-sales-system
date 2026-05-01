import { getPaymentMethods } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from 'flowbite-react'
import { useState } from 'react'
import PaymentMethod from './PaymentMethod'

export default function PaymentMethodList() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const {
    data: paymentMethods,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['checkout', 'payment-methods'],
    queryFn: async () => {
      const response = await getPaymentMethods()

      if (response.error || !response.data) {
        throw new Error(response.error?.message)
      }

      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  } else if (!paymentMethods || isError) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-red-500">
          {error?.message || 'An error occurred while fetching payment methods. Please try again.'}
        </span>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-6">
      {paymentMethods.map((method) => (
        <li key={method.name}>
          <PaymentMethod
            paymentMethod={method}
            isSelected={selectedMethod === method.name}
            onClick={() => setSelectedMethod(method.name)}
          />
        </li>
      ))}
    </ul>
  )
}
