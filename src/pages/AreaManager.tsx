// src/pages/AreaManager.tsx
import React, { useState, useEffect } from 'react'
import type { Area } from '../types'
import { useAuth } from '../context/useAuth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import { haptics } from '../lib/haptics'
import { IconMap, IconPlus } from '../components/Icons'
import { Button } from '../components/ui/Button'

export const AreaManager: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [areas, setAreas] = useState<Area[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const data = await apiFetch<Area[]>('/api/areas?limit=100')
        if (active) setAreas(data)
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to load areas'
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void fetchData()
    return () => {
      active = false
    }
  }, [toast])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const created = await apiFetch<Area>('/api/areas', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || null }),
      })
      setAreas(prev => [...prev, created])
      setName('')
      setDesc('')
      haptics.success()
      setSuccess(`Area "${created.name}" created successfully!`)
      toast.success(`Area "${created.name}" created!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create area'
      setError(msg)
      haptics.error()
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    haptics.warning()
    if (!window.confirm('Are you sure you want to delete this service area?')) return
    setError('')
    setSuccess('')
    setDeletingId(id)
    try {
      await apiFetch(`/api/areas/${id}`, { method: 'DELETE' })
      setAreas(prev => prev.filter(a => a.id !== id))
      haptics.success()
      setSuccess('Area deleted successfully!')
      toast.success('Area deleted successfully')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete area'
      setError(msg)
      haptics.error()
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <>
        <div className="section-header">
          <div className="skeleton-box" style={{ width: 160, height: 28 }} />
        </div>
        <div className="table-card" style={{ padding: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-box" style={{ width: '8%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '25%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '35%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '20%', height: 18 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Service Areas</h2>
      </div>

      {error && <div className="alert error">⚠ {error}</div>}
      {success && <div className="alert success">✓ {success}</div>}

      {user?.role === 'admin' && (
        <div className="table-card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Add New Service Area</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
              <label className="form-label" htmlFor="area-name">Area Name</label>
              <input
                id="area-name"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Downtown Central"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 2, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label" htmlFor="area-desc">Description</label>
              <input
                id="area-desc"
                className="form-input"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Zone details (optional)"
              />
            </div>
            <Button
              id="area-submit"
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              style={{ marginBottom: 0 }}
            >
              <IconPlus />
              Add Area
            </Button>
          </form>
        </div>
      )}

      <div className="table-card">
        {areas.length === 0 ? (
          <div className="empty-state">
            <IconMap />
            <h3>No areas registered</h3>
            <p>
              {user?.role === 'admin'
                ? 'Create the first service area using the form above.'
                : 'No registered service areas found.'}
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>#{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{a.description ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  {user?.role === 'admin' && (
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === a.id}
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
