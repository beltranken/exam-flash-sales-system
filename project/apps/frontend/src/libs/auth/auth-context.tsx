import { createContext } from 'react'

export interface AuthContextValue {
  id: number | null
  email: string | null
  isAuthenticated: boolean
  setAuthenticated: (session: { token: string; id: number; email: string }) => void
  clearAuthenticated: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
