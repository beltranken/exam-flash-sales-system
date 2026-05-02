import { centToDollars } from './centToDollars'

function roundToTwoDecimals(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function preparePrice(priceInCents: number, discountPercentage?: number) {
  const price = roundToTwoDecimals(centToDollars(priceInCents))
  const discountedPrice = discountPercentage
    ? roundToTwoDecimals(centToDollars(priceInCents * (1 - discountPercentage / 100)))
    : price

  return {
    regularPrice: price,
    discountedPrice,
  }
}
