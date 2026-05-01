import { refreshToken } from '@/api'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
  subscribeToAuthTokenChange,
  type AuthSession,
} from './auth-token'

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
  const [authSession, setAuthSessionState] = useState<AuthSession | null>(() => getAuthSession())
  const isAuthenticated = Boolean(authSession)

  const { mutate: refreshAuthToken } = useMutation({
    mutationFn: async () => {
      const response = await refreshToken()

      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'An error occurred while refreshing the token. Please try again.')
      }

      return response.data
    },
    retry: false,
  })
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    return subscribeToAuthTokenChange(() => {
      setAuthSessionState(getAuthSession())
    })
  }, [])

  useEffect(() => {
    if (hasCheckedAuth.current) return

    hasCheckedAuth.current = true

    refreshAuthToken(undefined, {
      onSuccess: (data) => {
        setAuthSession(data)
      },
      onError: () => {
        clearAuthSession()
      },
    })
  }, [refreshAuthToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      id: authSession?.id ?? null,
      email: authSession?.email ?? null,
      isAuthenticated,
      setAuthenticated: (session) => {
        setAuthSession(session)
      },
      clearAuthenticated: () => {
        clearAuthSession()
      },
    }),
    [authSession?.email, authSession?.id, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
