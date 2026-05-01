import { refreshToken } from '@/api'
import { client } from '@/api/client.gen'
import { clearAuthSession, getAccessToken, setAuthSession } from '@/libs/auth'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type RefreshTokenError = AxiosError & {
  config?: RetriableRequestConfig
}

type QueuedRequest = {
  resolve: (value: AxiosResponse) => void
  reject: (err: unknown) => void
  config: RetriableRequestConfig
}

type AxiosInterceptorRejected = (error: RefreshTokenError) => Promise<AxiosResponse>

let isRefreshing = false
let failedQueue: QueuedRequest[] = []

const rejectQueue = (error: unknown) => {
  failedQueue.forEach(({ reject }) => reject(error))
  failedQueue = []
}

const attachedTokenFn = (config: InternalAxiosRequestConfig) => {
  const isNonAuthRoute = config.url?.startsWith('/auth') === false
  const missingAuthHeader = !config.headers.Authorization
  const accessToken = getAccessToken()

  // Only attach the token to non-auth routes that don't already have an Authorization header
  if (isNonAuthRoute && missingAuthHeader && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}
const onRejected: AxiosInterceptorRejected = async (error) => {
  const originalRequest = error.config

  const isSigningIn = error.config?.url === '/auth/sign-in' || error.config?.url === '/auth/sign-in/confirm'

  if (!originalRequest) {
    return Promise.reject(error)
  }

  // Only attempt to refresh token if we receive a 401, we haven't already tried to refresh for this request, and we're not currently trying to sign in
  if (error.response?.status === 401 && !originalRequest._retry && !isSigningIn) {
    // If we're already trying to refresh the token, queue this request until it's done
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
          config: originalRequest,
        })
      })
    }

    // Mark the original request as having been retried to prevent infinite loops
    originalRequest._retry = true
    isRefreshing = true

    try {
      // Attempt to refresh the token
      const { data, error } = await refreshToken()
      if (data === undefined || error) {
        throw new Error('AuthData is undefined')
      }

      setAuthSession(data)

      // Retry all the requests that failed while we were refreshing the token
      failedQueue.forEach(({ config, resolve, reject }) => {
        config.headers.Authorization = `Bearer ${data.token}`
        client
          .instance(config)
          .then((response) => resolve(response))
          .catch((err) => reject(err))
      })

      // Retry the original request that triggered the token refresh
      originalRequest.headers.Authorization = `Bearer ${data.token}`
      return client.instance(originalRequest)
    } catch (refreshError) {
      console.log('Token refresh failed, logging out')

      // If token refresh fails, clear the access token and reject all queued requests
      clearAuthSession()
      rejectQueue(refreshError)

      return Promise.reject(refreshError)
    } finally {
      // Reset the refreshing state and clear the queue
      isRefreshing = false
      failedQueue = []
    }
  }

  return Promise.reject(error)
}

export default function setupInterceptors() {
  const onFulfilled = (response: AxiosResponse) => response

  const attachedToken = client.instance.interceptors.request.use(attachedTokenFn)
  const refreshToken = client.instance.interceptors.response.use(onFulfilled, onRejected)

  return {
    cleanUp: () => {
      client.instance.interceptors.request.eject(attachedToken)
      client.instance.interceptors.response.eject(refreshToken)
    },
  }
}
