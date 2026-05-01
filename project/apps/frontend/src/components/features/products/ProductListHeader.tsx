import FilterIcon from '@/icons/FilterIcon'
import SortIcon from '@/icons/SortIcon'

interface ProductListHeaderProps {
  mainCategoryTitle?: string
  subCategoryTitle?: string
  showingProductCount?: number
  totalProductCount?: number
}

export default function ProductListHeader({
  mainCategoryTitle,
  subCategoryTitle,
  showingProductCount,
  totalProductCount,
}: Readonly<ProductListHeaderProps>) {
  return (
    <header className="flex justify-between">
      <div>
        <h2 id="products-heading" className="text-xl font-bold">
          {mainCategoryTitle} / {subCategoryTitle}
        </h2>
        <span>
          {showingProductCount} of {totalProductCount} products
        </span>
      </div>

      <div className="flex gap-6">
        <button className="flex items-center justify-center gap-1">
          <span className="uppercase">filter</span>
          <FilterIcon className="h-4 w-4" />
        </button>
        <button className="flex items-center justify-center gap-1">
          <span className="uppercase">sort</span>
          <SortIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
