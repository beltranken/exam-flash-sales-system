import type { ValidateCartResponse } from '@/api'
import { centToDollars } from '@/utils/centToDollars'
import { HR } from 'flowbite-react'
import type { PropsWithChildren } from 'react'
import OrderItems from './OrderItems'

interface OrderSummaryProps {
  cart: ValidateCartResponse
  onRemoveItem: (productId: number) => void
}

export default function OrderSummary({ cart, onRemoveItem, children }: Readonly<PropsWithChildren<OrderSummaryProps>>) {
  return (
    <section className="border-border w-full border bg-white p-8 shadow">
      <h2 className="text-sm font-medium tracking-wider uppercase">Order Summary</h2>

      <div className="flex flex-col gap-4">
        <HR />

        <OrderItems items={cart.items} onRemoveItem={onRemoveItem} />

        <HR />

        <div className="mb-4 flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span>${centToDollars(cart.subtotalInCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Shipping</span>
            <span>FREE</span>
          </div>

          <div className="border-border flex justify-between border-t pt-4">
            <span className="text-lg font-medium">Total</span>
            <span className="font-medium">${centToDollars(cart.totalInCents)}</span>
          </div>
        </div>

        {children}
      </div>
    </section>
  )
}
