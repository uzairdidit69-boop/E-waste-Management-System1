// src/pages/RequestForm.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { Area, PickupRequest } from '../types'
import { apiFetch } from '../lib/api'
import { IconPlus } from '../components/Icons'

export const RequestForm: React.FC = () => {
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [areaId, setAreaId] = useState<number>(0)
  const [description, setDescription] = useState<string>('')
  const [loadingAreas, setLoadingAreas] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let active = true
    apiFetch<Area[]>('/api/areas?limit=100')
      .then(data => {
        if (active) {
          setAreas(data)
          if (data.length > 0) {
            setAreaId(data[0].id)
          }
        }
      })
      .catch(err => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load service areas')
        }
      })
      .finally(() => {
        if (active) setLoadingAreas(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!areaId) {
      setError('Please select a service area')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await apiFetch<PickupRequest>('/api/pickup-requests', {
        method: 'POST',
        body: JSON.stringify({
          area_id: areaId,
          description: description.trim() || null,
        }),
      })
      navigate('/requests')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingAreas) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="table-card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Pickup Request</h3>
        {error && <div className="alert error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-req-area">Service Area</label>
            <select
              id="new-req-area"
              className="form-input form-select"
              value={areaId}
              onChange={e => setAreaId(Number(e.target.value))}
              required
            >
              {areas.length === 0 && <option value="">No areas available</option>}
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-req-desc">Items Description</label>
            <textarea
              id="new-req-desc"
              className="form-input"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 2 laptop batteries, 1 broken CRT monitor, 3 desktop towers"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <Link to="/requests" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              id="submit-pickup-request"
              type="submit"
              className="btn btn-primary"
              disabled={submitting || areas.length === 0}
            >
              {submitting ? <span className="spinner" /> : <IconPlus />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
