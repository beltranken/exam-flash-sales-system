import { client } from '@/api/client.gen'
import setupInterceptors from './setup-interceptor'

export function setupApiClient() {
  client.setConfig({
    baseURL: import.meta.env.VITE_BACK_API_URL,
    withCredentials: true,
  })

  setupInterceptors()
}
