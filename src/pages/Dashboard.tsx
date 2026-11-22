// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { PickupRequest, Area } from '../types'
import { apiFetch } from '../lib/api'
import { IconPackage, IconRecycle } from '../components/Icons'

export const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let active = true
    const loadStats = async () => {
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
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadStats()
    return () => {
      active = false
    }
  }, [])

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  const recentRequests = requests.slice(0, 5)
  const areaName = (id: number) => areas.find(a => a.id === id)?.name ?? `Area #${id}`

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  return (
    <>
      {error && <div className="alert error">⚠ {error}</div>}

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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
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
        <Link to="/requests" className="btn btn-ghost" style={{ fontSize: 13 }}>
          View all →
        </Link>
      </div>

      <div className="table-card">
        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <IconPackage />
            <h3>No requests yet</h3>
            <p>Go to Pickup Requests to manage or submit a request.</p>
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
