import { Button } from 'flowbite-react'

interface PaymentStripeProps {
  onSuccess: () => void
}

export default function PaymentStripe({ onSuccess }: Readonly<PaymentStripeProps>) {
  return (
    <div className="border-border flex flex-col items-center gap-8 rounded border bg-white p-12 shadow">
      <h3 className="text-lg font-medium">Stripe</h3>
      <p className="text-center text-sm text-gray-600">
        You have selected to skip payment. This option is for testing purposes only and no actual payment will be
        processed.
      </p>

      <Button onClick={onSuccess}>Confirm</Button>
    </div>
  )
}
