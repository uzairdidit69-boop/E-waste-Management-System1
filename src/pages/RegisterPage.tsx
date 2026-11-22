// src/pages/RegisterPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../lib/toast'
import type { Role } from '../types'
import { IconRecycle } from '../components/Icons'
import { Button } from '../components/ui/Button'

export const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('requester')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, role)
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check inputs.'
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
        <h2 className="auth-heading">Create account</h2>
        <p className="auth-sub">Join the circular electronics network</p>

        {error && <div className="alert error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email address
            </label>
            <input
              id="register-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-role">
              Account Role
            </label>
            <select
              id="register-role"
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="requester">Requester (Household / Business Generator)</option>
              <option value="collector">Collector (Logistics & Transport)</option>
              <option value="recycler">Recycler (Certified Processing Facility)</option>
            </select>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Button
              id="register-submit"
              type="submit"
              variant="brand"
              size="lg"
              loading={loading}
              showArrow
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Create account
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
