import { mainCategories, subCategories } from '@/constants/categories'
import ProductListsPage from '@/pages/ProductListsPage'
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/$mainCategory/$subCategory')({
  beforeLoad: ({ params }) => {
    const isValidMain = mainCategories.some((category) => category.slug === params.mainCategory)
    const isValidSub = subCategories.some((category) => category.slug === params.subCategory)

    if (!isValidMain || !isValidSub) {
      throw notFound()
    }
  },
  component: ProductListsPage,
})
