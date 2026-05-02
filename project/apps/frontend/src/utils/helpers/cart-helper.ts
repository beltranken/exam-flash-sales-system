import { cartRequest } from '@/schemas/cartSchema'

export function addToCart(productId: number, quantity: number, promoId?: number) {
  localStorage.setItem(
    'cart',
    JSON.stringify({
      appliedPromoId: promoId,
      items: [{ productId, quantity }],
    }),
  )
}

export function getCart() {
  const rawCartStr = localStorage.getItem('cart')

  if (!rawCartStr) {
    return undefined
  }

  try {
    const rawCart = JSON.parse(rawCartStr)
    const cart = cartRequest.parse(rawCart)
    return cart
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error)
    return undefined
  }
}
