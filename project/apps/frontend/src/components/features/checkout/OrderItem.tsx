import type { ValidateCartResponse } from '@/api'
import TrashIcon from '@/icons/TrashIcon'
import clsx from 'clsx'
import ProductImage from '../products/ProductImage'

interface OrderItemProps {
  item: ValidateCartResponse['items'][number]
  onRemove?: () => void
}

export default function OrderItem({
  item: { product, quantity, subtotalInCents, totalInCents, issues },
  onRemove,
}: Readonly<OrderItemProps>) {
  const regularPrice = subtotalInCents
  const discountedPrice = totalInCents
  const hasDiscount = regularPrice !== discountedPrice

  const hasIssues = issues !== undefined && issues.length > 0

  return (
    <div
      className={clsx(
        'relative min-h-24 items-stretch border',
        hasIssues ? 'border-red-500 bg-red-50' : 'border-transparent',
      )}
    >
      <div className="flex h-full items-stretch gap-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden">
          <ProductImage image={product.image} />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-1">
          <div>
            <h3 className="text-sm font-medium">{product.name}</h3>
            <span className="text-gray-400">Bone White / OS</span>
            {quantity > 1 && <span className="text-sm text-gray-600">Qty: {quantity}</span>}
          </div>

          <div className="flex gap-1">
            {hasDiscount && <span className="text-gray-500 line-through">${regularPrice}</span>}
            <span className="text-primary-900 font-semibold">${discountedPrice}</span>
          </div>
        </div>
      </div>

      {hasIssues && (
        <>
          <button className="absolute top-0 right-0 p-3" onClick={onRemove}>
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>

          <ul className="my-2 list-['-_'] pl-5">
            {issues.map((issue) => (
              <li key={issue} className="text-sm text-red-500">
                <small className="font-medium">{issue}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
