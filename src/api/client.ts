import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { ErrorResponse } from './types'
import { removeItem } from '@/utils/storage'
import { getSecureItem, deleteSecureItem } from '@/utils/secureStorage'

// Storage key for authentication token
const AUTH_TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly payload: ErrorResponse

  constructor(payload: ErrorResponse) {
    super(payload.message)
    this.name = 'ApiError'
    this.statusCode = payload.status
    this.payload = payload
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach JWT to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getSecureItem(AUTH_TOKEN_KEY, {skipAuth: true})
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error attaching token to request:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear user data from AsyncStorage
      await removeItem('user')
      // Clear JWT from secure storage
      try {
        await deleteSecureItem(AUTH_TOKEN_KEY, {skipAuth: true})
      } catch (e) {
        console.error('Error clearing token:', e)
      }
    }

    if (error.response?.data) {
      throw new ApiError(error.response.data)
    }

    throw new ApiError({
      message: error.message || 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
      path: error.config?.url || 'unknown',
    })
  }
)

export async function get<T>(url: string): Promise<T> {
  const response = await apiClient.get<T>(url)
  return response.data
}

export async function post<T>(url: string, data: any): Promise<T> {
  const response = await apiClient.post<T>(url, data)
  return response.data
}

export async function put<T>(url: string, data: any): Promise<T> {
  const response = await apiClient.put<T>(url, data)
  return response.data
}

export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url)
  return response.data
}

export { apiClient }