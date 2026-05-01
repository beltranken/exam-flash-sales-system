import TopNav from '@/components/layout/TopNav'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getRouteApi, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const rootApi = getRouteApi('__root__')

export default function RootLayout() {
  const { login } = rootApi.useSearch()

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 text-gray-900">
        <TopNav />

        <div className="flex w-full flex-1 flex-col items-center px-5">
          <div className="w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>

      {login && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">Login Modal</div>}

      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
