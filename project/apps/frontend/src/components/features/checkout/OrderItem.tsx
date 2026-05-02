import type { ValidateCartResponse } from '@/api'
import TrashIcon from '@/icons/TrashIcon'
import clsx from 'clsx'
import ProductImage from '../products/ProductImage'

interface OrderItemProps {
  item: ValidateCartResponse['items'][number]
  onRemove?: () => void
}

export default function OrderItem({
  item: { product, quantity, subtotalInCents, totalInCents, removalReasons, warnings },
  onRemove,
}: Readonly<OrderItemProps>) {
  const regularPrice = subtotalInCents
  const discountedPrice = totalInCents
  const hasDiscount = regularPrice !== discountedPrice

  const hasCriticalIssues = removalReasons !== undefined && removalReasons.length > 0
  const hasWarnings = warnings !== undefined && warnings.length > 0

  return (
    <div
      className={clsx(
        'relative min-h-24 items-stretch border',
        hasCriticalIssues
          ? 'border-red-500 bg-red-50'
          : hasWarnings
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-transparent',
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

      {hasCriticalIssues && (
        <>
          <button className="absolute top-0 right-0 p-3" onClick={onRemove}>
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>

          <ul className="my-2 list-['-_'] pl-5">
            {removalReasons.map((removalReason) => (
              <li key={removalReason} className="text-sm text-red-500">
                <small className="font-medium">{removalReason}</small>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasWarnings && (
        <ul className="my-2 list-['-_'] pl-5">
          {warnings.map((warning) => (
            <li key={warning} className="text-sm text-yellow-600">
              <small className="font-medium">{warning}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
