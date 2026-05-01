import { getProducts } from '@/api'
import SideBarCategories from '@/components/features/products/SidebarCategories'
import { mainCategories, subCategories } from '@/constants/categories'
import ProductList from '@/features/products/ProductList'
import ProductListHeader from '@/features/products/ProductListHeader'
import PromoCard from '@/features/promos/PromoCard'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/$mainCategory/$subCategory')

export default function ProductListsPage() {
  const { mainCategory, subCategory } = routeApi.useParams()

  const { data, isPending, isLoading } = useInfiniteQuery({
    queryKey: ['products', mainCategory, subCategory],
    queryFn: async () => {
      const response = await getProducts()

      if (response.error || !response.data) {
        throw new Error(response.error.message)
      }

      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  })

  const products = data?.pages.flatMap((page) => page) ?? []

  const mainCategoryTitle = mainCategories.find((c) => c.slug === mainCategory)?.name
  const subCategoryTitle = subCategories.find((c) => c.slug === subCategory)?.name

  return (
    <div className="flex w-full gap-5">
      <SideBarCategories mainCategory={mainCategory} subCategory={subCategory} />

      <section className="flex flex-1 flex-col gap-8" aria-labelledby="products-heading">
        <PromoCard />

        <ProductListHeader
          mainCategoryTitle={mainCategoryTitle}
          subCategoryTitle={subCategoryTitle}
          showingProductCount={products.length}
          totalProductCount={products.length}
        />

        <ProductList isLoading={isLoading} isPending={isPending} products={products} />
      </section>
    </div>
  )
}
