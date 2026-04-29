import { Outlet } from '@tanstack/react-router'

export default function RootComponent() {
  return (
    <>
      <div className="flex gap-2 border-b p-2 text-lg"></div>
      <hr />
      <Outlet />
      {/* Start rendering router matches */}
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  )
}
