const authSessionKey = 'authSession'
const authTokenChangedEvent = 'auth-token-changed'

export interface AuthSession {
  token: string
  id: number
  email: string
}

export function getAccessToken() {
  return getAuthSession()?.token
}

export function getAuthSession(): AuthSession | null {
  const rawSession = localStorage.getItem(authSessionKey)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession) as Partial<AuthSession>

    if (typeof session.token !== 'string' || typeof session.id !== 'number' || typeof session.email !== 'string') {
      return null
    }

    return {
      token: session.token,
      id: session.id,
      email: session.email,
    }
  } catch {
    return null
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(authSessionKey, JSON.stringify(session))
  window.dispatchEvent(new Event(authTokenChangedEvent))
}

export function clearAuthSession() {
  localStorage.removeItem(authSessionKey)
  window.dispatchEvent(new Event(authTokenChangedEvent))
}

export function subscribeToAuthTokenChange(callback: () => void) {
  window.addEventListener(authTokenChangedEvent, callback)

  return () => {
    window.removeEventListener(authTokenChangedEvent, callback)
  }
}
