type ProductKeyParams = {
  productId: number
}

type UserProductUsageKeyParams = ProductKeyParams & {
  userId: number
}

type UserPromoUsageKeyParams = UserProductUsageKeyParams & {
  promoId: number
}

type OrderStatusKeyParams = {
  orderId: string
}

type RollbackReservationItem = {
  productId: number
  quantity: number
  appliedPromoId?: number | null
}

export const stocksByProduct = ({ productId }: ProductKeyParams) => `stocksByProduct:${productId}`

export const userProductUsage = ({ userId, productId }: UserProductUsageKeyParams) =>
  `userProductUsage:${userId}:${productId}`

export const userPromoUsage = ({ promoId, userId, productId }: UserPromoUsageKeyParams) =>
  `userPromoUsage:${promoId}:${userId}:${productId}`

export const order = ({ orderId }: OrderStatusKeyParams) => `order:${orderId}`

export const buildRollbackReservationArgs = (items: RollbackReservationItem[], userId: number): string[] =>
  items.flatMap((item) => [
    stocksByProduct({ productId: item.productId }),
    userProductUsage({ userId, productId: item.productId }),
    item.appliedPromoId ? userPromoUsage({ userId, productId: item.productId, promoId: item.appliedPromoId }) : '',
    String(item.quantity),
    '0',
    '0',
    '0',
  ])

export const cacheKeys = {
  stocksByProduct,
  userProductUsage,
  userPromoUsage,
  order,
}

export const rollbackCartReservationsScript = 'rollback-cart-reservations-script'
