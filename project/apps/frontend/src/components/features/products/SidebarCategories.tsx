import { subCategories } from '@/constants/categories'
import BagIcon from '@/icons/BagIcon'
import DashboardIcon from '@/icons/DashboardIcon'
import DressIcon from '@/icons/DressIcon'
import FireIcon from '@/icons/FireIcon'
import HangerIcon from '@/icons/HangerIcon'
import JacketIcon from '@/icons/JacketIcon'
import { Link } from '@tanstack/react-router'
import clsx from 'clsx'

interface SideBarCategoriesProps {
  mainCategory: string
  subCategory?: string
}

export default function SideBarCategories({ mainCategory, subCategory }: Readonly<SideBarCategoriesProps>) {
  const Icons = [
    (className: string) => <DashboardIcon key="dashboard" className={className} aria-hidden="true" />,
    (className: string) => <HangerIcon key="hanger" className={className} aria-hidden="true" />,
    (className: string) => <JacketIcon key="jacket" className={className} aria-hidden="true" />,
    (className: string) => <DressIcon key="dress" className={className} aria-hidden="true" />,
    (className: string) => <BagIcon key="bag" className={className} aria-hidden="true" />,
    (className: string) => <FireIcon key="fire" className={className} aria-hidden="true" />,
  ]

  return (
    <aside
      aria-label="Category filter"
      className="flex max-h-full min-h-137.5 w-auto min-w-75 flex-col gap-10 bg-white p-10"
    >
      <div>
        <h3 className="text-lg font-medium">Categories</h3>
        <small className="text-gray-400">Select a category</small>
      </div>

      <ul className="space-y-2">
        {subCategories.map((category, i) => {
          return (
            <li key={category.slug} aria-current={subCategory === category.slug ? 'page' : undefined}>
              <Link
                to={'/$mainCategory/$subCategory'}
                params={{ mainCategory, subCategory: category.slug }}
                className={clsx(
                  'flex gap-3 px-2 py-4',
                  subCategory === category.slug ? 'bg-gray-200' : 'bg-transparent',
                )}
                aria-label={category.name}
              >
                {Icons.at(i)?.(clsx(subCategory === category.slug ? 'text-normal' : 'text-gray-500'))}

                <span
                  className={clsx(subCategory === category.slug ? 'font-bold text-black' : 'font-normal text-gray-500')}
                >
                  {category.name}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
