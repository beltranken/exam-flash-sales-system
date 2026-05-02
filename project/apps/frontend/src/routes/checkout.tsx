import { mainCategories } from '@/constants/categories'
import CheckoutPage from '@/pages/CheckoutPage'
import { getCart } from '@/utils/helpers/cart-helper'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
  beforeLoad: () => {
    const cart = getCart()
    if (cart && cart.items.length === 0) {
      const mainCategory = mainCategories[0].slug

      throw redirect({
        to: '/$mainCategory/$subCategory',
        params: {
          mainCategory,
          subCategory: 'all',
        },
      })
    }
  },
})
