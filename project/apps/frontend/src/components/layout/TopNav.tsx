import { mainCategories } from '@/constants/categories'
import CartIcon from '@/icons/CartIcon'
import CloseIcon from '@/icons/CloseIcon'
import HeartIcon from '@/icons/HeartIcon'
import UserIcon from '@/icons/UserIcon'
import { getRouteApi, Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { useState } from 'react'

const routeKey = '/$mainCategory/$subCategory'
const routeApi = getRouteApi(routeKey)

export default function TopNav() {
  const { mainCategory } = routeApi.useParams()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <nav className="bg-neutral-primary border-border inset-s-0 top-0 z-20 flex w-full flex-col items-center border-b px-5 py-5">
      <div className="flex w-full max-w-5xl flex-wrap items-center justify-between py-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-7" alt="Flowbite Logo" />
          <span className="text-heading self-center text-xl font-semibold whitespace-nowrap">Flowbite</span>
        </div>

        <div
          className={clsx(
            'fixed top-0 bottom-0 left-0 flex h-full w-full flex-col items-end md:relative md:block md:h-auto md:w-auto md:bg-transparent',
            {
              hidden: !isMenuOpen,
              fixed: isMenuOpen,
            },
          )}
        >
          <div className="md:auto border-border flex h-full w-full max-w-xl flex-col items-start border-l bg-white pt-5 md:h-auto md:border-0 md:bg-transparent md:pt-0">
            <button onClick={handleToggleMenu} className="block px-5 md:hidden">
              <CloseIcon />
            </button>

            <ul className="bg-neutral-secondary-soft md:bg-neutral-primary mt-4 flex w-full flex-col p-4 font-medium md:mt-0 md:w-auto md:flex-row md:space-x-8 md:border-0 md:p-0">
              <li className="block md:hidden">
                <Link
                  to={routeKey}
                  params={{ mainCategory: mainCategories.at(0)?.slug ?? '', subCategory: 'all' }}
                  className="bg-brand md:text-fg-brand block w-auto px-3 py-2 text-white md:bg-transparent"
                >
                  Home
                </Link>
              </li>

              {mainCategories.map((menu) => {
                const isActive = mainCategory === menu.slug

                return (
                  <li key={menu.slug}>
                    <Link
                      disabled={isActive}
                      to={routeKey}
                      params={{ mainCategory: menu.slug, subCategory: 'all' }}
                      className={clsx(
                        'text-heading hover:bg-neutral-tertiary md:hover:text-fg-brand block border-b-2',
                        'px-3 py-2 uppercase md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent',
                        isActive ? 'border-gray-950' : 'border-transparent',
                      )}
                    >
                      {menu.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <HeartIcon />
          <CartIcon />
          <UserIcon />

          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="text-body hover:bg-neutral-secondary-soft hover:text-heading focus:ring-neutral-tertiary inline-flex h-10 w-10 items-center justify-center p-2 text-sm focus:ring-2 focus:outline-none md:hidden"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen}
            onClick={handleToggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
