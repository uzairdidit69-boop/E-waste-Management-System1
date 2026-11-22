// src/pages/RequestList.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { PickupRequest, Area, RequestStatus } from '../types'
import { useAuth } from '../context/useAuth'
import { apiFetch } from '../lib/api'
import { IconPackage, IconPlus } from '../components/Icons'

export const RequestList: React.FC = () => {
  const { user } = useAuth()
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
          setError(err instanceof Error ? err.message : 'Failed to load requests')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void fetchData()
    return () => {
      active = false
    }
  }, [])

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this pickup request?')) return
    setUpdatingId(id)
    setError('')
    try {
      await apiFetch(`/api/pickup-requests/${id}`, { method: 'DELETE' })
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete request')
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Pickup Requests</h2>
        {user?.role === 'requester' && (
          <Link to="/requests/new" id="new-request-btn" className="btn btn-primary">
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
                      {canAcceptOrComplete && r.status === 'pending' && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'accepted')}
                        >
                          {updatingId === r.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Accept'}
                        </button>
                      )}

                      {canAcceptOrComplete && r.status === 'accepted' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'completed')}
                        >
                          {updatingId === r.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Complete'}
                        </button>
                      )}

                      {canCancel && (r.status === 'pending' || (user?.role === 'admin' && r.status === 'accepted')) && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 12, color: 'var(--color-danger)' }}
                          disabled={updatingId === r.id}
                          onClick={() => handleStatusChange(r.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      )}

                      {canDelete && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 12, color: 'var(--color-danger)', marginLeft: 6 }}
                          disabled={updatingId === r.id}
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      )}
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
