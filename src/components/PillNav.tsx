// src/components/PillNav.tsx
// ─────────────────────────────────────────────────────────────
// PHASE 0 ROOT CAUSE:
//   The old implementation used Tailwind utility classes (fixed, hidden,
//   md:flex, rounded-full, etc.) but Tailwind is NOT installed – those
//   class names were dead. Only the inline style={{ }} props applied,
//   turning the <nav> into a full-width block element with no layout.
//   Additionally, it was NOT portalled to document.body, so any GSAP/Lenis
//   ancestor transform broke position:fixed containment.
//
// FIX: 100% inline styles, createPortal to document.body, no Tailwind.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ChevronDown, User, LogOut, ArrowUpRight, Menu, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { haptics } from '../lib/haptics'

interface NavDropdownItem {
  label: string
  href: string
  desc: string
}

const requesterLinks: NavDropdownItem[] = [
  { label: 'Schedule Pickup', href: '/requests/new', desc: 'Book a collection for your devices' },
  { label: 'My Requests', href: '/requests', desc: 'Track pending and completed pickups' },
  { label: 'Service Areas', href: '/areas', desc: 'Supported pickup regions' },
]

const collectorLinks: NavDropdownItem[] = [
  { label: 'Pickup Dashboard', href: '/requests', desc: 'View pending requests in your area' },
  { label: 'Assigned Routes', href: '/requests', desc: 'Active collections assigned to you' },
  { label: 'Coverage Areas', href: '/areas', desc: 'Supported municipal zones' },
]

const recyclerLinks: NavDropdownItem[] = [
  { label: 'Facility Inbound', href: '/requests', desc: 'Verified shipments received' },
  { label: 'Recycling Partners', href: '/areas', desc: 'Certified e-waste processing hubs' },
  { label: 'Compliance & Audit', href: '/requests', desc: 'Zero-landfill certs & reports' },
]

type MenuKey = 'requester' | 'collector' | 'recycler' | 'mobile' | null

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768

// ── Shared style tokens ─────────────────────────────────────
const ITEM_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  whiteSpace: 'nowrap',
  color: 'rgba(255,255,255,0.88)',
  fontFamily: 'inherit',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: 1,
  padding: '0 12px',
  height: '40px',
  minWidth: '44px',
  borderRadius: '999px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
  transition: 'background 160ms, color 160ms',
  userSelect: 'none',
}

const DROPDOWN_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 10px)',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '268px',
  padding: '10px',
  borderRadius: '20px',
  background: 'rgba(11,11,20,0.96)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  zIndex: 10,
}

export const PillNav: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null)
  const [mobile, setMobile] = useState(isMobile)
  const [mounted] = useState(() => typeof document !== 'undefined')
  const navRef = useRef<HTMLDivElement>(null)

  // Responsive breakpoint
  useEffect(() => {
    const onResize = () => setMobile(isMobile())
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close on Esc / outside click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null)
    }
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleOutside)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleOutside)
    }
  }, [])

  const toggleMenu = useCallback((key: MenuKey) => {
    haptics.select()
    setActiveMenu((prev) => (prev === key ? null : key))
  }, [])

  const renderDropdown = (items: NavDropdownItem[], title: string) => (
    <div style={DROPDOWN_STYLE}>
      <div
        style={{
          padding: '4px 10px 8px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        {title}
      </div>
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          onClick={() => { haptics.tap(); setActiveMenu(null) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'background 140ms',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: '2px',
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
              {item.desc}
            </div>
          </div>
          <ArrowUpRight size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        </Link>
      ))}
    </div>
  )

  // Mobile bottom-sheet
  const renderMobileSheet = () => (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(320px, calc(100vw - 32px))',
        padding: '16px',
        borderRadius: '20px',
        background: 'rgba(11,11,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        zIndex: 10,
        color: '#FFFFFF',
      }}
    >
      {[
        { title: 'For Requesters', items: requesterLinks },
        { title: 'For Collectors', items: collectorLinks },
        { title: 'For Recyclers', items: recyclerLinks },
      ].map((group) => (
        <div key={group.title} style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#FFA05A',
              marginBottom: '6px',
              paddingLeft: '4px',
            }}
          >
            {group.title}
          </div>
          {group.items.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => { haptics.tap(); setActiveMenu(null) }}
              style={{
                display: 'block',
                padding: '8px 8px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.88)',
                textDecoration: 'none',
                transition: 'background 140ms',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )

  if (!mounted) return null

  const nav = (
    // ── Transparent outer wrapper: fixed, full-width, click-through ──
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* ── Shrink-wrap inner pill ── */}
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Main floating navigation"
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          padding: '8px',
          borderRadius: '999px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'rgba(11,11,20,0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        {/* Home button */}
        <Link
          to="/"
          aria-label="EcoTrack Home"
          onPointerDown={() => haptics.tap()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.9)',
            background: 'rgba(255,255,255,0.12)',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 160ms, transform 120ms',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'
          }}
        >
          <Home size={18} />
        </Link>

        {/* Desktop nav items */}
        {!mobile && (
          <>
            {/* Requesters */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleMenu('requester')}
                aria-expanded={activeMenu === 'requester'}
                style={ITEM_STYLE}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.88)'
                }}
              >
                <span>Requesters</span>
                <ChevronDown
                  size={13}
                  style={{
                    color: activeMenu === 'requester' ? '#FFA05A' : 'rgba(255,255,255,0.5)',
                    transition: 'transform 180ms, color 180ms',
                    transform: activeMenu === 'requester' ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {activeMenu === 'requester' && renderDropdown(requesterLinks, 'For Requesters')}
            </div>

            {/* Collectors */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleMenu('collector')}
                aria-expanded={activeMenu === 'collector'}
                style={ITEM_STYLE}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.88)'
                }}
              >
                <span>Collectors</span>
                <ChevronDown
                  size={13}
                  style={{
                    color: activeMenu === 'collector' ? '#FFA05A' : 'rgba(255,255,255,0.5)',
                    transition: 'transform 180ms, color 180ms',
                    transform: activeMenu === 'collector' ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {activeMenu === 'collector' && renderDropdown(collectorLinks, 'For Collectors')}
            </div>

            {/* Recyclers */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleMenu('recycler')}
                aria-expanded={activeMenu === 'recycler'}
                style={ITEM_STYLE}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.88)'
                }}
              >
                <span>Recyclers</span>
                <ChevronDown
                  size={13}
                  style={{
                    color: activeMenu === 'recycler' ? '#FFA05A' : 'rgba(255,255,255,0.5)',
                    transition: 'transform 180ms, color 180ms',
                    transform: activeMenu === 'recycler' ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {activeMenu === 'recycler' && renderDropdown(recyclerLinks, 'For Recyclers')}
            </div>
          </>
        )}

        {/* Mobile menu button */}
        {mobile && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleMenu('mobile')}
              aria-label={activeMenu === 'mobile' ? 'Close menu' : 'Open menu'}
              aria-expanded={activeMenu === 'mobile'}
              style={ITEM_STYLE}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {activeMenu === 'mobile' ? <X size={16} /> : <Menu size={16} />}
              <span>Menu</span>
            </button>
            {activeMenu === 'mobile' && renderMobileSheet()}
          </div>
        )}

        {/* Separator */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.12)',
            margin: '0 4px',
            flexShrink: 0,
          }}
        />

        {/* Auth pill */}
        {user ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Link
              to="/dashboard"
              onPointerDown={() => haptics.tap()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 14px',
                height: '36px',
                borderRadius: '999px',
                background: '#FFA05A',
                color: '#0B0B14',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'background 160ms, transform 120ms',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#ff9142'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#FFA05A'
              }}
            >
              <User size={13} />
              {!mobile && <span>Dashboard</span>}
            </Link>
            <button
              onClick={() => { haptics.tap(); logout(); navigate('/login') }}
              title="Log out"
              aria-label="Log out"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 160ms, color 160ms',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onPointerDown={() => haptics.tap()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 16px',
              height: '36px',
              borderRadius: '999px',
              background: '#FFA05A',
              color: '#0B0B14',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 160ms',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#ff9142'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#FFA05A'
            }}
          >
            Sign in
          </Link>
        )}
      </nav>
    </div>
  )

  return createPortal(nav, document.body)
}
