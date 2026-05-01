import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addToCart, getCart } from './cart-helper'

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    clear: () => {
      store = {}
    },
    getItem: (key: string) => store[key] ?? null,
    removeItem: (key: string) => {
      delete store[key]
    },
    setItem: (key: string, value: string) => {
      store[key] = value
    },
  }
})()

describe('cart utils', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('addToCart', () => {
    it('stores a cart item in localStorage', () => {
      addToCart(12, 3)

      expect(localStorage.getItem('cart')).toBe(JSON.stringify([{ productId: 12, quantity: 3 }]))
    })
  })

  describe('getCart', () => {
    it('returns an empty array when no cart is stored', () => {
      expect(getCart()).toEqual([])
    })

    it('returns the parsed cart when localStorage contains valid cart data', () => {
      localStorage.setItem(
        'cart',
        JSON.stringify([
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ]),
      )

      expect(getCart()).toEqual([
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ])
    })

    it('returns an empty array and logs an error when stored cart JSON is invalid', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      localStorage.setItem('cart', '{invalid')

      expect(getCart()).toEqual([])
      expect(consoleError).toHaveBeenCalled()
    })

    it('returns an empty array and logs an error when stored cart data fails schema validation', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      localStorage.setItem('cart', JSON.stringify([{ productId: 1, quantity: 0 }]))

      expect(getCart()).toEqual([])
      expect(consoleError).toHaveBeenCalled()
    })
  })
})
