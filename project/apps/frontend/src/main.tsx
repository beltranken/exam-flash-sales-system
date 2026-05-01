import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createTheme, ThemeProvider } from 'flowbite-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeInit } from '../.flowbite-react/init'
import { setupApiClient } from './libs/api/setup-api-client'
import { AuthProvider } from './libs/auth'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

setupApiClient()

const customTheme = createTheme({
  button: {
    base: 'relative flex items-center justify-center rounded-none text-center font-medium focus:outline-none focus:ring-4',
  },
  textInput: {
    field: {
      input: {
        base: 'block w-full border-0 border-b border-gray-300 bg-transparent focus:border-gray-900 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
        colors: {
          gray: 'text-gray-900 placeholder-gray-500',
          failure: 'bg-transparent',
        },
        withAddon: {
          on: 'rounded-none',
          off: 'rounded-none',
        },
      },
      rightIcon: {
        svg: 'h-10 w-10 text-green-600',
      },
    },
  },
})

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)

  root.render(
    <StrictMode>
      <ThemeInit />
      <ThemeProvider theme={customTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
