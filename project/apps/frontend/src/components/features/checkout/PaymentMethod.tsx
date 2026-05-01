import type { GetPaymentMethodsResponse } from '@/api'
import clsx from 'clsx'
import { Radio } from 'flowbite-react'

interface PaymentMethodProps {
  paymentMethod: GetPaymentMethodsResponse[number]
  isSelected?: boolean
  onClick?: () => void
}

export default function PaymentMethod({ paymentMethod, isSelected, onClick }: PaymentMethodProps) {
  return (
    <button
      type="button"
      className={clsx('w-full border-2 bg-white p-6', isSelected ? 'border-primary-500' : 'border-border')}
      onClick={onClick}
    >
      <div className="flex w-full justify-between">
        <div className="grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-2">
          <Radio readOnly checked={isSelected} />
          <span className="text-left font-semibold">{paymentMethod.name}</span>

          <div></div>
          <span className="text-left text-sm text-gray-600">{paymentMethod.description}</span>
        </div>

        <div></div>
      </div>
    </button>
  )
}
