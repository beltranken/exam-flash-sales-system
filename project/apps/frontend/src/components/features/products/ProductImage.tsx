import ImageIcon from '@/icons/ImageIcon'

interface ProductImageProps {
  image?: string | null
  name?: string
}

export default function ProductImage({ image, name }: Readonly<ProductImageProps>) {
  const imageSrc = image ?? '/images/default-product.jpg'

  return (
    <>
      {imageSrc ? (
        <img className="h-full w-full object-cover" src={imageSrc} alt={name} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded bg-gray-100">
          <ImageIcon className="h-20 w-20 text-gray-300" />
        </div>
      )}
    </>
  )
}
