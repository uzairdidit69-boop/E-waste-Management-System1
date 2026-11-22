// src/lib/api.ts
/**
 * Typed HTTP client wrapper for EcoTrack API.
 * - Same-origin relative path /api by default
 * - Auto Bearer token attachment from localStorage
 * - Redirects on 401
 * - Formats server error detail
 */

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

const RAW_BASE = import.meta.env.VITE_API_URL ?? '/api'
const BASE_URL = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = BASE_URL.endsWith('/api') && path.startsWith('/api/')
    ? `${BASE_URL.slice(0, -4)}${path}`
    : `${BASE_URL}${path}`

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      window.location.href = '/login'
    }
    const errBody = await res.json().catch(() => ({ detail: 'Session expired. Please log in again.' }))
    const msg = typeof errBody.detail === 'string' ? errBody.detail : 'Unauthorized'
    throw new ApiError(401, msg)
  }

  if (!res.ok) {
    let message = res.statusText || 'An error occurred'
    try {
      const text = await res.text()
      try {
        const errBody = JSON.parse(text)
        if (typeof errBody.detail === 'string') {
          message = errBody.detail
        } else if (Array.isArray(errBody.detail)) {
          message = errBody.detail
            .map((d: { msg?: string }) => d.msg ?? (typeof d === 'string' ? d : JSON.stringify(d)))
            .join(', ')
        } else if (typeof errBody.message === 'string') {
          message = errBody.message
        }
      } catch {
        if (text && text.trim().length > 0 && text.length < 300) {
          message = text.trim()
        }
      }
    } catch {
      // keep fallback message
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json()
}

