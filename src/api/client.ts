import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { ErrorResponse } from './types'
import { removeItem } from '@/utils/storage'
import * as SecureStore from 'expo-secure-store'
import { getItem, deleteItem } from "@/utils/secureStorage"

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
  baseURL: 'http://192.168.1.79:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach JWT to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItem('auth_token', {skipAuth: true})
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
      // Clear JWT from SecureStore
      try {
        await deleteItem('auth_token', {skipAuth: true})
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