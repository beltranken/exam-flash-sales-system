import type { GetPromosResponse, ValidateCartResponse } from '@shared/api-client'
import CheckIcon from '@/icons/CheckIcon'
import { centToDollars } from '@/utils/centToDollars'
import { HR } from 'flowbite-react'
import type { PropsWithChildren } from 'react'
import OrderItems from './OrderItems'

interface OrderSummaryProps {
  cart: ValidateCartResponse
  onRemoveItem: (productId: number) => void
}

export default function OrderSummary({ cart, onRemoveItem, children }: Readonly<PropsWithChildren<OrderSummaryProps>>) {
  const promos = cart.items.reduce(
    (accu, cartItem) => {
      const appliedPromo = cartItem.appliedPromo
      if (!appliedPromo) {
        return accu
      }

      const index = accu.findIndex((promo) => promo.id === appliedPromo.id)

      if (index >= 0) {
        accu[index].totalDiscountInCents += cartItem.discountInCents
        return accu
      }

      return [
        ...accu,
        {
          ...appliedPromo,
          totalDiscountInCents: cartItem.discountInCents,
        },
      ]
    },
    [] as (GetPromosResponse[number] & { totalDiscountInCents: number })[],
  )

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

          {promos.map((promo) => (
            <div key={promo.id} className="flex justify-between border border-green-500 bg-white p-4 shadow">
              <div className="flex items-center justify-center gap-1">
                <CheckIcon className="h-5 w-5" />
                <span className="text-sm font-semibold text-gray-600">{promo.code}</span>
              </div>
              <span className="text-sm text-green-600">-${centToDollars(promo.totalDiscountInCents)}</span>
            </div>
          ))}

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
