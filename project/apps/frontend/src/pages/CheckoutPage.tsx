import CheckoutSection from '@/features/checkout/CheckoutSection'
import OrderSummary from '@/features/checkout/OrderSummary'
import PaymentMethodList from '@/features/checkout/PaymentMethodList'
import SignIn from '@/features/users/SignIn'
import { useAuth } from '@/libs/auth'
import { getCart } from '@/utils/helpers/cart-helper'
import { useQuery } from '@tanstack/react-query'

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()

  const { data: products } = useQuery({
    queryKey: ['cart', isAuthenticated ? 'auth' : 'guest'],
    queryFn: async () => {
      const cart = await getCart()
      return cart
    },
  })

  return (
    <div className="flex w-full gap-16 py-24">
      <div className="flex flex-1 flex-col gap-12">
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">Checkout</h1>

          <CheckoutSection stepNumber={1} title="Verify Email">
            <SignIn />
          </CheckoutSection>
        </div>

        <CheckoutSection stepNumber={2} title="Select Payment Method">
          <PaymentMethodList />
        </CheckoutSection>
      </div>

      <div className="w-100">
        <OrderSummary cartItems={products ?? []} />
      </div>
    </div>
  )
}
