import { centToDollars } from './centToDollars'

export function preparePrice(priceInCents: number, discountPercentage?: number) {
  const price = centToDollars(priceInCents)
  const discountedPrice = discountPercentage ? centToDollars(priceInCents * (1 - discountPercentage / 100)) : price

  return {
    regularPrice: price,
    discountedPrice,
  }
}
