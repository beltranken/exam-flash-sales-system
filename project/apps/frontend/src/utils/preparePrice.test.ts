import { describe, expect, it } from 'vitest'
import { preparePrice } from './preparePrice'

describe('preparePrice', () => {
  it('returns the regular price and matching discounted price when no discount is provided', () => {
    expect(preparePrice(2500)).toEqual({
      regularPrice: 25,
      discountedPrice: 25,
    })
  })

  it('applies the discount percentage to the discounted price', () => {
    expect(preparePrice(2500, 20)).toEqual({
      regularPrice: 25,
      discountedPrice: 20,
    })
  })

  it('treats a zero discount as no discount', () => {
    expect(preparePrice(2500, 0)).toEqual({
      regularPrice: 25,
      discountedPrice: 25,
    })
  })

  it('rounds fractional discounted prices to two decimals', () => {
    expect(preparePrice(999, 15)).toEqual({
      regularPrice: 9.99,
      discountedPrice: 8.49,
    })
  })
})
