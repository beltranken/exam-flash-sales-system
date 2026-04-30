import { loginSearchSchema } from '@/schemas/loginSearchSchema'
import { createRootRoute } from '@tanstack/react-router'
import RootLayout from '../pages/RootLayout'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
      </div>
    )
  },
  validateSearch: loginSearchSchema,
})
