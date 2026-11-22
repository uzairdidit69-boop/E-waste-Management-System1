// src/context/AuthContext.tsx
import React, { useState, useEffect, useCallback } from 'react'
import type { User, Role, AuthResponse } from '../types'
import { apiFetch } from '../lib/api'
import { AuthContext } from './auth-context-base'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('token'))

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  // Restore session on initial load if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) return

    let isMounted = true
    apiFetch<User>('/api/users/me')
      .then(userData => {
        if (isMounted) {
          setUser(userData)
          setToken(savedToken)
        }
      })
      .catch(() => {
        if (isMounted) {
          logout()
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [logout])

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('token', res.access_token)
    setToken(res.access_token)
    const userData = await apiFetch<User>('/api/users/me')
    setUser(userData)
  }

  const register = async (email: string, password: string, role: Role) => {
    await apiFetch<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
    await login(email, password)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
