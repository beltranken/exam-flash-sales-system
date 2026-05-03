import { makeSkipPayment, type MakeSkipPaymentData } from '@/api'
import { useMutation } from '@tanstack/react-query'
import { Button } from 'flowbite-react'

interface PaymentStripeProps {
  onSuccess: () => void
  orderId: string
}

export default function PaymentStripe({ onSuccess, orderId }: Readonly<PaymentStripeProps>) {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: MakeSkipPaymentData['body']) => {
      // TODO: change to stripe payment when implemented
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
    <div className="border-border flex flex-col items-center gap-8 rounded border bg-white p-12 shadow">
      <h3 className="text-lg font-medium">Stripe</h3>
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
