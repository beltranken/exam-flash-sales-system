import { cartSchema } from '@/schemas/cartSchema'

export function addToCart(productId: number, quantity: number) {
  localStorage.setItem('cart', JSON.stringify([{ productId, quantity }]))
}

export function getCart() {
  const rawCartStr = localStorage.getItem('cart')

  if (!rawCartStr) {
    return []
  }

  try {
    const rawCart = JSON.parse(rawCartStr)
    const cart = cartSchema.parse(rawCart)
    return cart
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error)
    return []
  }
}
