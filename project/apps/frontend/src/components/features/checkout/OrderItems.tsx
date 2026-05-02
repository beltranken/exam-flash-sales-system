import type { ValidateCartResponse } from '@/api'
import OrderItem from './OrderItem'

interface OrderItemsProps {
  items: ValidateCartResponse['items']
  onRemoveItem: (productId: number) => void
}

export default function OrderItems({ items, onRemoveItem }: OrderItemsProps) {
  return (
    <ul className="flex flex-col gap-6">
      {items.map((item) => (
        <li key={item.product.id}>
          <OrderItem item={item} onRemove={() => onRemoveItem(item.product.id)} />
        </li>
      ))}
    </ul>
  )
}
