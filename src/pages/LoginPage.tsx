// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../lib/toast'
import { IconRecycle } from '../components/Icons'
import { Button } from '../components/ui/Button'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Signed in successfully!')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb green" />
      <div className="auth-bg-orb blue" />
      <div className="auth-card">
        <Link to="/" style={{ textDecoration: 'none' }} className="auth-logo">
          <div className="auth-logo-icon">
            <IconRecycle />
          </div>
          <div className="auth-logo-text">
            <h1>EcoTrack</h1>
            <p>E-Waste Management System</p>
          </div>
        </Link>
        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="alert error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Button
              id="auth-submit"
              type="submit"
              variant="brand"
              size="lg"
              loading={loading}
              showArrow
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
