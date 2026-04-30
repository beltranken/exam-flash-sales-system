import SideBarCategories from '@/components/features/products/SidebarCategories'
import PromoCard from '@/features/promos/PromoCard'
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/$mainCategory/$subCategory')

export default function ProductListsPage() {
  const { mainCategory, subCategory } = routeApi.useParams()

  return (
    <div className="flex w-full gap-5">
      <SideBarCategories mainCategory={mainCategory} subCategory={subCategory} />

      <main className="flex-1">
        <PromoCard />
      </main>
    </div>
  )
}
