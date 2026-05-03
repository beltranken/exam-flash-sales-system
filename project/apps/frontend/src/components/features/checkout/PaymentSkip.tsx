import { Button } from 'flowbite-react'

interface PaymentSkipProps {
  onSuccess: () => void
}

export default function PaymentSkip({ onSuccess }: Readonly<PaymentSkipProps>) {
  return (
    <div className="flex flex-col items-center gap-8 bg-white p-12">
      <h3 className="text-lg font-medium">Payment Skipped</h3>
      <p className="text-center text-sm text-gray-600">
        You have selected to skip payment. This option is for testing purposes only and no actual payment will be
        processed.
      </p>

      <Button onClick={onSuccess}>Confirm</Button>
    </div>
  )
}
