// src/components/HelpFab.tsx
// Portalled to document.body. Pure inline styles – no Tailwind.
// Fixed round button at bottom-right, lifted above nav on small viewports.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react'
import { haptics } from '../lib/haptics'

export const HelpFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [mounted] = useState(() => typeof document !== 'undefined')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    query: 'pickup',
    message: '',
  })
  const popoverRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close popover on outside click / Esc
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const handleOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleOutside)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [isOpen])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      haptics.success()
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
        setFormData({ name: '', email: '', query: 'pickup', message: '' })
      }, 2200)
    },
    [],
  )

  // Bottom offset: lift above pill nav on narrow viewports
  const bottomOffset = narrow ? '96px' : 'calc(24px + env(safe-area-inset-bottom, 0px))'
  const rightOffset = 'calc(20px + env(safe-area-inset-right, 0px))'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    borderRadius: '12px',
    border: '1px solid rgba(11,11,20,0.1)',
    background: '#F5F6FA',
    color: '#0B0B14',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 160ms, background 160ms',
    boxSizing: 'border-box',
  }

  if (!mounted) return null

  const content = (
    <>
      {/* FAB Button */}
      <button
        ref={fabRef}
        onClick={() => { haptics.tap(); setIsOpen((v) => !v) }}
        aria-label={isOpen ? 'Close help chat' : 'Open help chat'}
        aria-expanded={isOpen}
        style={{
          position: 'fixed',
          right: rightOffset,
          bottom: bottomOffset,
          width: 'clamp(52px, 4.5vw, 68px)',
          height: 'clamp(52px, 4.5vw, 68px)',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: '#FFA05A',
          color: '#0B0B14',
          border: 'none',
          cursor: 'pointer',
          boxShadow: isOpen
            ? '0 8px 32px rgba(255,160,90,0.65)'
            : '0 8px 28px rgba(255,160,90,0.5)',
          zIndex: 999,
          transition: 'transform 160ms cubic-bezier(0.22,1,0.36,1), box-shadow 160ms',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.94)'
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={22} />}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="EcoTrack Help"
          style={{
            position: 'fixed',
            right: rightOffset,
            bottom: `calc(${bottomOffset} + clamp(52px, 4.5vw, 68px) + 12px)`,
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(255,255,255,0.99)',
            borderRadius: '24px',
            border: '1px solid rgba(11,11,20,0.08)',
            boxShadow: '0 24px 64px rgba(11,11,20,0.18)',
            zIndex: 999,
            color: '#0B0B14',
            overflow: 'hidden',
            animation: 'fabPopIn 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <style>{`
            @keyframes fabPopIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to   { opacity: 1; transform: scale(1)    translateY(0);   }
            }
            @media (prefers-reduced-motion: reduce) {
              @keyframes fabPopIn { from { opacity: 0; } to { opacity: 1; } }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px 14px',
              borderBottom: '1px solid rgba(11,11,20,0.06)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>EcoTrack Support</h3>
              <p style={{ fontSize: '12px', color: '#6B6B7B', margin: '2px 0 0' }}>
                Fast assistance for pickups & recycling
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close help"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: '#6B6B7B',
                cursor: 'pointer',
                transition: 'background 140ms',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(11,11,20,0.06)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px 20px' }}>
            {submitted ? (
              <div
                style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <CheckCircle2 size={40} style={{ color: '#1F4BFF' }} />
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Message Sent!</div>
                <p style={{ fontSize: '12px', color: '#6B6B7B' }}>
                  Our dispatch team will respond within 15 minutes.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1F4BFF'
                      ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,11,20,0.1)'
                      ;(e.currentTarget as HTMLElement).style.background = '#F5F6FA'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1F4BFF'
                      ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,11,20,0.1)'
                      ;(e.currentTarget as HTMLElement).style.background = '#F5F6FA'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    How can we help?
                  </label>
                  <select
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1F4BFF'
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,11,20,0.1)'
                    }}
                  >
                    <option value="pickup">Schedule bulk e-waste pickup</option>
                    <option value="collector">Collector partner inquiry</option>
                    <option value="recycling">Recycling certs & compliance</option>
                    <option value="other">General question</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your device types or address..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1F4BFF'
                      ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,11,20,0.1)'
                      ;(e.currentTarget as HTMLElement).style.background = '#F5F6FA'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  onPointerDown={() => haptics.tap()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    width: '100%',
                    height: '42px',
                    borderRadius: '999px',
                    background: '#1F4BFF',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 160ms, transform 120ms',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#1236C9'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#1F4BFF'
                  }}
                  onPointerUp={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  }}
                >
                  <span>Send Message</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )

  return createPortal(content, document.body)
}
