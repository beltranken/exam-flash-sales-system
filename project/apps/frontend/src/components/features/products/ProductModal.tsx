import { getProductById, type GetProductStockByIdData } from '@/api'
import CloseIcon from '@/icons/CloseIcon'
import { addToCart } from '@/utils/helpers/cart-helper'
import { preparePrice } from '@/utils/preparePrice'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button, HR, Modal, ModalBody, Spinner } from 'flowbite-react'
import ProductImage from './ProductImage'

interface ProductModalProps {
  productId: GetProductStockByIdData['path']['productId']
  onClose: () => void
}

export default function ProductModal({ productId, onClose }: Readonly<ProductModalProps>) {
  const navigate = useNavigate()
  const {
    data: product,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required to fetch product details')
      }

      const response = await getProductById({
        path: {
          productId,
        },
      })

      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch product details')
      }

      return response.data
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  })

  const discountPercentage = 10

  const handleBuyNow = (id: number) => {
    addToCart(id, 1)
    navigate({
      to: '/checkout',
    })
    onClose()
  }

  let BodyContent

  if (isLoading) {
    BodyContent = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-20">
        <Spinner />
        <span className="ml-2 text-gray-500">Loading product...</span>
      </div>
    )
  } else if (!product || isError) {
    BodyContent = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-20">
        <span className="ml-2 text-gray-500">Unable to fetch product details.</span>
      </div>
    )
  } else {
    const { regularPrice, discountedPrice } = preparePrice(product.priceInCents, discountPercentage)

    BodyContent = (
      <>
        <div className="absolute top-0 bottom-0 left-0 h-full w-[calc(100%-var(--container-lg))] flex-1">
          <ProductImage image={product?.image} name={product.name} />
        </div>
        <div className="min-h-full w-lg overflow-y-auto px-16 py-8">
          <div className="absolute top-6 right-6">
            <button
              type="button"
              className="text-body hover:bg-neutral-tertiary hover:text-heading rounded-base ms-auto inline-flex h-9 w-9 items-center justify-center bg-transparent text-sm"
              data-modal-hide="default-modal"
              onClick={onClose}
            >
              <CloseIcon className="h-4 w-4" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="flex w-full flex-col gap-2">
            <h1 className="text-4xl font-semibold">{product.name}</h1>

            <div className="flex items-end gap-3">
              <span className="text-primary-900 text-2xl font-bold">${discountedPrice}</span>
              {discountPercentage && (
                <span className="text-lg font-semibold text-gray-500 line-through">${regularPrice}</span>
              )}
            </div>
          </div>
          <div className="py-10">
            <HR />
          </div>

          <div className="flex-1">
            <p className="text-gray-500">{product.description}</p>
          </div>

          <div className="py-10">
            <HR />
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full py-5" onClick={() => handleBuyNow(product.id)}>
              BUY NOW
            </Button>

            <Button className="w-full py-5" outline>
              ADD TO WISHLIST
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <Modal dismissible show={!!productId} onClose={onClose} size="7xl" popup>
      <ModalBody className="relative m-0 flex h-[min(57.5rem,83vh)] items-stretch justify-end overflow-hidden bg-white p-0">
        {BodyContent}
      </ModalBody>
    </Modal>
  )
}
