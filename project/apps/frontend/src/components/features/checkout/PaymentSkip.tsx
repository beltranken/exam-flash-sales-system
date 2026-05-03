import { makeSkipPayment, type MakeSkipPaymentData } from '@/api'
import { useMutation } from '@tanstack/react-query'
import { Button } from 'flowbite-react'

interface PaymentSkipProps {
  orderId: string
  onSuccess: () => void
}

export default function PaymentSkip({ orderId, onSuccess }: Readonly<PaymentSkipProps>) {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: MakeSkipPaymentData['body']) => {
      const response = await makeSkipPayment({
        body: data,
      })

      if (response.error) {
        throw new Error(response.error?.message || 'Failed to skip payment')
      }

      return
    },
  })

  const handleOnConfirm = () => {
    mutate(
      {
        orderId,
        paymentMethod: 'Skip Payment',
      },
      {
        onSuccess: () => {
          onSuccess()
        },
      },
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 bg-white p-12">
      <h3 className="text-lg font-medium">Payment Skipped</h3>
      <p className="text-center text-sm text-gray-600">
        You have selected to skip payment. This option is for testing purposes only and no actual payment will be
        processed.
      </p>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <Button onClick={handleOnConfirm} disabled={isPending}>
        {isPending ? 'Processing...' : 'Confirm'}
      </Button>
    </div>
  )
}
