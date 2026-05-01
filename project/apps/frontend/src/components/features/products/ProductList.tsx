import { type GetProductByIdResponse, type GetProductsResponse } from '@/api'
import { Spinner } from 'flowbite-react'
import { useState } from 'react'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

interface ProductListHeaderProps {
  isLoading?: boolean
  isPending?: boolean
  products: GetProductsResponse
}

export default function ProductList({ isLoading, products }: Readonly<ProductListHeaderProps>) {
  const [selectedProduct, setSelectedProduct] = useState<GetProductByIdResponse['id'] | null>(null)

  return (
    <div className="pb-40">
      <ul className="grid grid-cols-3 gap-x-4 gap-y-16">
        {[...products, ...products, ...products, ...products, ...products].map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              onClick={() => setSelectedProduct(product.id)}
              isOpen={selectedProduct === product.id}
            />
          </li>
        ))}
      </ul>

      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <span className="ml-2 text-gray-500">No products found.</span>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Spinner />
          <span className="ml-2 text-gray-500">Loading products...</span>
        </div>
      )}

      {selectedProduct && <ProductModal productId={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}
