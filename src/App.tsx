import { useState, useEffect, useCallback } from 'react'
import './App.css'

// ─── Types ──────────────────────────────────────────────────────
type Role = 'requester' | 'collector' | 'recycler' | 'admin'
type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled'

interface User {
  id: number
  email: string
  role: Role
  is_active: boolean
  created_at: string
}

interface Area {
  id: number
  name: string
  description: string | null
  created_at: string
}

interface PickupRequest {
  id: number
  requester_id: number
  area_id: number
  status: RequestStatus
  description: string | null
  requested_at: string
  scheduled_at: string | null
  completed_at: string | null
}

// ─── API ──────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? ''

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'An error occurred')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Icons ───────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
)

const IconPackage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
  </svg>
)

const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconRecycle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

// ─── Auth Page ──────────────────────────────────────────────────
function AuthPage({ onAuth }: { onAuth: (token: string, user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('requester')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })
      }
      const { access_token } = await apiFetch<{ access_token: string }>('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      })
      const user = await apiFetch<User>('/api/users/me', {}, access_token)
      localStorage.setItem('token', access_token)
      onAuth(access_token, user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb green" />
      <div className="auth-bg-orb blue" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><IconRecycle /></div>
          <div className="auth-logo-text">
            <h1>EcoTrack</h1>
            <p>E-Waste Management System</p>
          </div>
        </div>
        <h2 className="auth-heading">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className="auth-sub">{mode === 'login' ? 'Sign in to your account' : 'Join the platform today'}</p>

        {error && <div className="alert error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email address</label>
            <input id="auth-email" className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-role">Role</label>
              <select id="auth-role" className="form-input form-select" value={role} onChange={e => setRole(e.target.value as Role)}>
                <option value="requester">Requester (I need waste pickup)</option>
                <option value="collector">Collector (I collect waste)</option>
                <option value="recycler">Recycler (I process waste)</option>
              </select>
            </div>
          )}
          <button id="auth-submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button id="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Overview ──────────────────────────────────────────
function DashboardView({ requests, areas }: { requests: PickupRequest[]; areas: Area[] }) {
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  const recentRequests = [...requests].slice(0, 5)

  const areaName = (id: number) => areas.find(a => a.id === id)?.name ?? `Area #${id}`

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><IconPackage /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><IconRecycle /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Recent Pickup Requests</h2>
      </div>
      <div className="table-card">
        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <IconPackage />
            <h3>No requests yet</h3>
            <p>Go to Pickup Requests to create your first request.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Area</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>#{r.id}</td>
                  <td>{areaName(r.area_id)}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{new Date(r.requested_at).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ─── New Request Modal ────────────────────────────────────────────
function NewRequestModal({ areas, token, onCreated, onClose }: {
  areas: Area[]
  token: string
  onCreated: (r: PickupRequest) => void
  onClose: () => void
}) {
  const [areaId, setAreaId] = useState(areas[0]?.id ?? 0)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const r = await apiFetch<PickupRequest>('/api/pickup-requests/', {
        method: 'POST',
        body: JSON.stringify({ area_id: areaId, description: description || null }),
      }, token)
      onCreated(r)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Pickup Request</span>
          <button id="modal-close" className="modal-close" onClick={onClose}><IconX /></button>
        </div>
        {error && <div className="alert error">⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="req-area">Area</label>
            <select id="req-area" className="form-input form-select" value={areaId} onChange={e => setAreaId(Number(e.target.value))}>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="req-desc">Description (optional)</label>
            <textarea id="req-desc" className="form-input" rows={3} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="E.g. 2 old laptops, 1 CRT monitor" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button id="modal-cancel" type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="modal-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <IconPlus />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Requests View ───────────────────────────────────────────────
function RequestsView({ requests, areas, token, user, onUpdate }: {
  requests: PickupRequest[]
  areas: Area[]
  token: string
  user: User
  onUpdate: (r: PickupRequest) => void
}) {
  const [showNew, setShowNew] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const areaName = (id: number) => areas.find(a => a.id === id)?.name ?? `Area #${id}`

  const handleStatusChange = async (id: number, status: RequestStatus) => {
    setUpdatingId(id)
    try {
      const updated = await apiFetch<PickupRequest>(`/api/pickup-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token)
      onUpdate(updated)
    } finally {
      setUpdatingId(null)
    }
  }

  const canUpdateStatus = user.role === 'collector' || user.role === 'admin'

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Pickup Requests</h2>
        {user.role === 'requester' && (
          <button id="new-request-btn" className="btn btn-primary" onClick={() => setShowNew(true)}>
            <IconPlus /> New Request
          </button>
        )}
      </div>

      <div className="table-card">
        {requests.length === 0 ? (
          <div className="empty-state">
            <IconPackage />
            <h3>No requests found</h3>
            <p>Create your first pickup request to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Area</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Description</th>
                {canUpdateStatus && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>#{r.id}</td>
                  <td>{areaName(r.area_id)}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{new Date(r.requested_at).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.description ?? '—'}</td>
                  {canUpdateStatus && (
                    <td>
                      {r.status === 'pending' && (
                        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'accepted')}>
                          {updatingId === r.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Accept'}
                        </button>
                      )}
                      {r.status === 'accepted' && (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'completed')}>
                          {updatingId === r.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Complete'}
                        </button>
                      )}
                    </td>
                  )}
                  {user.role === 'requester' && r.status === 'pending' && (
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: 'var(--color-danger)' }}
                        disabled={updatingId === r.id}
                        onClick={() => handleStatusChange(r.id, 'cancelled')}>
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && areas.length > 0 && (
        <NewRequestModal
          areas={areas}
          token={token}
          onCreated={r => { onUpdate(r); setShowNew(false) }}
          onClose={() => setShowNew(false)}
        />
      )}
    </>
  )
}

// ─── Areas View ──────────────────────────────────────────────────
function AreasView({ areas, token, user, onCreated }: {
  areas: Area[]
  token: string
  user: User
  onCreated: (a: Area) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const a = await apiFetch<Area>('/api/areas/', {
        method: 'POST',
        body: JSON.stringify({ name, description: desc || null }),
      }, token)
      onCreated(a)
      setName(''); setDesc('')
      setSuccess(`Area "${a.name}" created successfully!`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create area')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Service Areas</h2>
      </div>

      {user.role === 'admin' && (
        <div className="table-card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Add New Area</h3>
          {error && <div className="alert error">⚠ {error}</div>}
          {success && <div className="alert success">✓ {success}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
              <label className="form-label" htmlFor="area-name">Area Name</label>
              <input id="area-name" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Downtown" required />
            </div>
            <div className="form-group" style={{ flex: 2, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label" htmlFor="area-desc">Description</label>
              <input id="area-desc" className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" />
            </div>
            <button id="area-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: 0 }}>
              {loading ? <span className="spinner" /> : <IconPlus />}
              Add Area
            </button>
          </form>
        </div>
      )}

      <div className="table-card">
        {areas.length === 0 ? (
          <div className="empty-state">
            <IconMap />
            <h3>No areas registered</h3>
            <p>Admins can add service areas from this page.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>#{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{a.description ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

// ─── Main App ────────────────────────────────────────────────────
type View = 'dashboard' | 'requests' | 'areas'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [requests, setRequests] = useState<PickupRequest[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Auto-login if token exists
  useEffect(() => {
    if (token && !user) {
      apiFetch<User>('/api/users/me', {}, token)
        .then(setUser)
        .catch(() => { setToken(null); localStorage.removeItem('token') })
    }
  }, [token, user])

  const loadData = useCallback(async () => {
    if (!token) return
    setLoadingData(true)
    try {
      const [r, a] = await Promise.all([
        apiFetch<PickupRequest[]>('/api/pickup-requests/', {}, token),
        apiFetch<Area[]>('/api/areas/', {}, token),
      ])
      setRequests(r)
      setAreas(a)
    } catch { /* ignore */ } finally {
      setLoadingData(false)
    }
  }, [token])

  useEffect(() => { if (user) loadData() }, [user, loadData])

  const handleAuth = (tok: string, u: User) => { setToken(tok); setUser(u) }
  const handleLogout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('token')
    setRequests([]); setAreas([])
  }

  if (!token || !user) return <AuthPage onAuth={handleAuth} />

  const initials = user.email.slice(0, 2).toUpperCase()

  const viewTitles: Record<View, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your e-waste activity' },
    requests: { title: 'Pickup Requests', subtitle: 'Manage waste collection requests' },
    areas: { title: 'Service Areas', subtitle: 'Regions available for waste pickup' },
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <IconRecycle />
          <div>
            <h1>EcoTrack</h1>
            <span>E-Waste Platform</span>
          </div>
        </div>

        <span className="nav-section-label">Navigation</span>

        <div id="nav-dashboard" className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
          <IconDashboard /> Dashboard
        </div>
        <div id="nav-requests" className={`nav-item ${view === 'requests' ? 'active' : ''}`} onClick={() => setView('requests')}>
          <IconPackage /> Pickup Requests
        </div>
        <div id="nav-areas" className={`nav-item ${view === 'areas' ? 'active' : ''}`} onClick={() => setView('areas')}>
          <IconMap /> Service Areas
        </div>

        <div className="sidebar-spacer" />

        <span className="nav-section-label">Account</span>
        <div style={{ padding: '8px 14px', fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{user.email}</div>
          <div style={{ color: 'var(--color-primary)', fontSize: 12, textTransform: 'capitalize', marginTop: 2 }}>
            {user.role}
          </div>
        </div>
        <div id="nav-logout" className="nav-item" onClick={handleLogout}>
          <IconLogout /> Sign out
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{viewTitles[view].title}</div>
            <div className="topbar-subtitle">{viewTitles[view].subtitle}</div>
          </div>
          <div className="topbar-actions">
            {loadingData && <span className="spinner" style={{ color: 'var(--color-primary)' }} />}
            <button id="topbar-refresh" className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={loadData}>Refresh</button>
            <div className="avatar" title={user.email}>{initials}</div>
          </div>
        </header>

        <div className="content">
          {view === 'dashboard' && <DashboardView requests={requests} areas={areas} />}
          {view === 'requests' && (
            <RequestsView
              requests={requests}
              areas={areas}
              token={token}
              user={user}
              onUpdate={r => setRequests(prev => {
                const idx = prev.findIndex(x => x.id === r.id)
                if (idx === -1) return [r, ...prev]
                const next = [...prev]; next[idx] = r; return next
              })}
            />
          )}
          {view === 'areas' && (
            <AreasView
              areas={areas}
              token={token}
              user={user}
              onCreated={a => setAreas(prev => [...prev, a])}
            />
          )}
        </div>
      </main>
    </div>
  )
}
