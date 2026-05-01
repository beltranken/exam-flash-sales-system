import type { GetProductByIdResponse } from '@/api'
import { preparePrice } from '@/utils/preparePrice'
import ProductImage from './ProductImage'

interface ProductCardProps {
  product: GetProductByIdResponse
  discountPercentage?: number
  onClick?: () => void
  isOpen?: boolean
}

export default function ProductCard({
  product,
  discountPercentage = 10,
  onClick,
  isOpen = false,
}: Readonly<ProductCardProps>) {
  const { regularPrice, discountedPrice } = preparePrice(product.priceInCents, discountPercentage)

  const ariaAttributes = onClick
    ? ({
        'aria-haspopup': 'dialog',
        'aria-expanded': isOpen,
        'aria-controls': 'product-modal',
      } as const)
    : undefined

  return (
    <button className="flex flex-col gap-6 rounded" onClick={onClick} type="button" {...ariaAttributes}>
      <div className="relative h-80 w-full overflow-hidden">
        <ProductImage image={product.image} name={product.name} />
      </div>

      <div className="w-full">
        <div className="flex justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="flex-1 truncate text-start text-lg font-bold">{product.name}</h3>
          </div>

          <div className="flex gap-1">
            {discountPercentage && <span className="text-gray-500 line-through">${regularPrice}</span>}
            <span className="text-primary-900 font-semibold">${discountedPrice}</span>
          </div>
        </div>
        <p className="text-start text-gray-500">{product.description}</p>
      </div>
    </button>
  )
}
