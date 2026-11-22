// src/pages/RequestList.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { PickupRequest, Area, RequestStatus } from '../types'
import { useAuth } from '../context/useAuth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import { haptics } from '../lib/haptics'
import { IconPackage, IconPlus } from '../components/Icons'
import { Button } from '../components/ui/Button'

export const RequestList: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [requests, setRequests] = useState<PickupRequest[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const [reqData, areaData] = await Promise.all([
          apiFetch<PickupRequest[]>('/api/pickup-requests?limit=100'),
          apiFetch<Area[]>('/api/areas?limit=100'),
        ])
        if (active) {
          setRequests(reqData)
          setAreas(areaData)
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to load requests'
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

  const areaName = (id: number) => areas.find(a => a.id === id)?.name ?? `Area #${id}`

  const handleStatusChange = async (id: number, status: RequestStatus) => {
    setUpdatingId(id)
    setError('')
    try {
      const updated = await apiFetch<PickupRequest>(`/api/pickup-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setRequests(prev => prev.map(r => (r.id === id ? updated : r)))
      haptics.success()
      toast.success(`Request #${id} marked as ${status}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update request'
      setError(msg)
      haptics.error()
      toast.error(msg)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    haptics.warning()
    if (!window.confirm('Are you sure you want to delete this pickup request?')) return
    setUpdatingId(id)
    setError('')
    try {
      await apiFetch(`/api/pickup-requests/${id}`, { method: 'DELETE' })
      setRequests(prev => prev.filter(r => r.id !== id))
      haptics.success()
      toast.success(`Request #${id} deleted`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete request'
      setError(msg)
      haptics.error()
      toast.error(msg)
    } finally {
      setUpdatingId(null)
    }
  }

  const canAcceptOrComplete = user?.role === 'collector' || user?.role === 'admin'
  const canCancel = user?.role === 'requester' || user?.role === 'admin'
  const canDelete = user?.role === 'admin'
  const hasActions = canAcceptOrComplete || canCancel || canDelete

  if (loading) {
    return (
      <>
        <div className="section-header">
          <div className="skeleton-box" style={{ width: 180, height: 28 }} />
        </div>
        <div className="table-card" style={{ padding: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-box" style={{ width: '8%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '22%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '15%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '18%', height: 18 }} />
              <div className="skeleton-box" style={{ width: '25%', height: 18 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Pickup Requests</h2>
        {user?.role === 'requester' && (
          <Link to="/requests/new" id="new-request-btn" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <IconPlus /> New Request
          </Link>
        )}
      </div>

      {error && <div className="alert error">⚠ {error}</div>}

      <div className="table-card">
        {requests.length === 0 ? (
          <div className="empty-state">
            <IconPackage />
            <h3>No requests found</h3>
            <p>
              {user?.role === 'requester'
                ? 'Submit your first waste collection request using the button above.'
                : 'No pickup requests matching your role currently.'}
            </p>
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
                {hasActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>#{r.id}</td>
                  <td>{areaName(r.area_id)}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(r.requested_at).toLocaleDateString()}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.description ?? '—'}</td>
                  {hasActions && (
                    <td>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {canAcceptOrComplete && r.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={updatingId === r.id}
                            onClick={() => handleStatusChange(r.id, 'accepted')}
                          >
                            Accept
                          </Button>
                        )}

                        {canAcceptOrComplete && r.status === 'accepted' && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={updatingId === r.id}
                            onClick={() => handleStatusChange(r.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}

                        {canCancel && (r.status === 'pending' || (user?.role === 'admin' && r.status === 'accepted')) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: 'var(--color-danger)' }}
                            disabled={updatingId === r.id}
                            onClick={() => handleStatusChange(r.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={updatingId === r.id}
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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
