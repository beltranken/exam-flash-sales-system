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

type PaymentStatusKeyParams = {
  paymentId: string
}

type ProductsKeyParams = {
  page: number
  pageSize?: number
}

type PromosKeyParams = {
  page: number
  pageSize?: number
  status?: string[]
  temporalStatus?: string
  productsIds?: number[]
}

type ReservationItem = {
  productId: number
  quantity: number
  limitPerUser: number
  limitResetIntervalDays?: number | null
  appliedPromoId?: number | null
  promoLimitPerUser?: number | null
}

type RollbackReservationItem = {
  productId: number
  quantity: number
  appliedPromoId?: number | null
}

const sortArrayNumber = (keys: number[]) => [...new Set(keys)].sort()
const sortArrayString = (keys: string[]) => [...new Set(keys)].sort()

export const stocksByProduct = ({ productId }: ProductKeyParams) => `stocksByProduct:${productId}`

export const userProductUsage = ({ userId, productId }: UserProductUsageKeyParams) =>
  `userProductUsage:${userId}:${productId}`

export const userPromoUsage = ({ promoId, userId, productId }: UserPromoUsageKeyParams) =>
  `userPromoUsage:${promoId}:${userId}:${productId}`

export const order = ({ orderId }: OrderStatusKeyParams) => `order:${orderId}`

export const orderStatus = ({ orderId }: OrderStatusKeyParams) => `orderStatus:${orderId}`

export const products = ({ page, pageSize }: ProductsKeyParams) => `products:${page}:${pageSize || 'all'}`

export const paymentStatus = ({ paymentId }: PaymentStatusKeyParams) => `paymentStatus:${paymentId}`

export const promos = ({ page, pageSize, status, temporalStatus, productsIds }: PromosKeyParams) => {
  const _status = status ? sortArrayString(status).join(',') : 'allStatus'
  const _temporalStatus = temporalStatus ? temporalStatus : 'allTemporalStatus'
  const _productIds = productsIds ? `${sortArrayNumber(productsIds).join(',')}` : 'allProductIds'

  return `promos:${page}:${pageSize || 'all'}:${_status}:${_temporalStatus}:${_productIds}`
}

export const promo = ({ promoId }: { promoId: number }) => `promo:${promoId}`

export const user = ({ userId }: { userId: number }) => `user:${userId}`

export const buildReservationArgs = (items: ReservationItem[], userId: number): string[] =>
  items.flatMap((item) => [
    stocksByProduct({ productId: item.productId }),
    userProductUsage({ userId, productId: item.productId }),
    item.appliedPromoId ? userPromoUsage({ userId, productId: item.productId, promoId: item.appliedPromoId }) : '',
    String(item.quantity),
    String(item.limitPerUser),
    String(item.limitResetIntervalDays ? item.limitResetIntervalDays * 24 * 60 * 60 : 0),
    String(item.promoLimitPerUser ?? 0),
  ])

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
  user,
  userProductUsage,
  userPromoUsage,
  order,
  orderStatus,
  products,
  paymentStatus,
  promo,
  promos,
}

export const reserveCartScript = 'reserve-cart-script'
export const rollbackCartReservationsScript = 'rollback-cart-reservations-script'
