import { getPaymentMethods } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from 'flowbite-react'
import PaymentMethod from './PaymentMethod'

interface PaymentMethodListProps {
  selectedMethod?: string
  onSelectMethod: (method: string) => void
}

export default function PaymentMethodList({ selectedMethod, onSelectMethod }: Readonly<PaymentMethodListProps>) {
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
        <li key={method.id}>
          <PaymentMethod
            paymentMethod={method}
            isSelected={selectedMethod === method.id}
            onClick={() => onSelectMethod(method.id)}
          />
        </li>
      ))}
    </ul>
  )
}
