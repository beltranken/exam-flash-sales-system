import { validateCart, type ValidateCartResponse } from '@/api'
import Alert from '@/components/base/Alert'
import Loading from '@/components/base/Loading'
import CheckoutSection from '@/features/checkout/CheckoutSection'
import OrderSummary from '@/features/checkout/OrderSummary'
import PaymentMethodList from '@/features/checkout/PaymentMethodList'
import SignIn from '@/features/users/SignIn'
import { useAuth } from '@/libs/auth'
import type { CartRequest } from '@/schemas/cartSchema'
import { getCart } from '@/utils/helpers/cart-helper'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isFirst = useRef(true)

  const { isAuthenticated } = useAuth()

  // `isFirst` is a one-shot request flag, not query identity.
  /* eslint-disable @tanstack/query/exhaustive-deps */
  const {
    data: cart,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      // Get cache cart
      const cart = getCart()

      if (!cart || cart.items.length === 0) {
        // No cart, return empty
        throw new Error('Cart is empty')
      }

      const findActivePromo = isFirst.current

      const response = await validateCart({
        body: {
          appliedPromoId: cart.appliedPromoId,
          items: cart.items.map((item) => ({ ...item, quantity: item.quantity })),
          findActivePromo,
        },
      })

      if (!response.data && response.error) {
        throw new Error(response.error.message || 'Failed to validate cart')
      }

      isFirst.current = false

      // update the local cached cart
      const newCart: CartRequest = {
        appliedPromoId: response.data?.appliedPromo?.id,
        items:
          response.data?.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })) || [],
      }

      localStorage.setItem('cart', JSON.stringify(newCart))

      return response.data
    },
    enabled: false,
  })
  /* eslint-enable @tanstack/query/exhaustive-deps */

  useEffect(() => {
    refetch()
  }, [refetch, isAuthenticated])

  const handleRemoveItem = async (productId: number) => {
    const currentCart = getCart()

    if (currentCart) {
      const newCart: CartRequest = {
        ...currentCart,
        items: currentCart.items.filter((item) => item.productId !== productId),
      }

      localStorage.setItem('cart', JSON.stringify(newCart))
    }

    queryClient.setQueryData<ValidateCartResponse>(['cart'], (old) => {
      if (!old) return old

      const items = old.items.filter((item) => item.product.id !== productId)

      return {
        ...old,
        items,
        subtotalInCents: items.reduce((total, item) => total + item.subtotalInCents, 0),
        totalDiscountInCents: items.reduce((total, item) => total + item.discountInCents, 0),
        totalInCents: items.reduce((total, item) => total + item.totalInCents, 0),
      }
    })
  }

  const redirectToHome = () => {
    navigate({ to: '/' })
  }

  if (isPending)
    return (
      <div className="">
        <Loading />
      </div>
    )

  if ((isError && !cart) || cart?.items.length === 0) {
    return <Alert message="Failed to load cart" onClose={redirectToHome} />
  }

  return (
    <div className="flex w-full flex-col gap-16 py-24 md:flex-row">
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

      <div className="w-full md:w-100">
        <OrderSummary cart={cart} onRemoveItem={handleRemoveItem} />
      </div>

      {isError && <Alert message="Failed validating the cart" onClose={redirectToHome} />}
    </div>
  )
}
