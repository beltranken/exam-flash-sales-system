import { Paging } from './index.js'
import { Order } from './types/orders.type.js'
import { Product } from './types/products.type.js'
import { Promo } from './types/promos.type.js'
import { User } from './types/users.type.js'

type CounterKeyParams = {
  productId: Product['id']
  userId: User['id']
  promoId: Promo['id']
  orderId: Order['id']
}

// Available stocks per product
export const stocksByProduct = ({ productId }: Pick<CounterKeyParams, 'productId'>) => `stocksByProduct:${productId}`

// Count of user purchases for a product
export const userProductUsage = ({ userId, productId }: Pick<CounterKeyParams, 'userId' | 'productId'>) =>
  `userProductUsage:${userId}:${productId}`

// Count of user purchases for a product during a promo
export const userPromoUsage = ({
  promoId,
  userId,
  productId,
}: Pick<CounterKeyParams, 'promoId' | 'userId' | 'productId'>) => `userPromoUsage:${promoId}:${userId}:${productId}`

// Status of an order
export const orderStatus = ({ orderId }: Pick<CounterKeyParams, 'orderId'>) => `orderStatus:${orderId}`

// Resources
export const products = ({ page, pageSize }: Paging) => `products:${page}:${pageSize ?? 'all'}`

export const cacheKeys = {
  stocksByProduct,
  userProductUsage,
  userPromoUsage,
  orderStatus,
  products,
}
