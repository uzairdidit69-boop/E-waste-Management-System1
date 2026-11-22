// src/components/PillNav.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, ChevronDown, User, LogOut, ArrowUpRight, Menu, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'

interface NavDropdownItem {
  label: string
  href: string
  desc: string
}

const requesterLinks: NavDropdownItem[] = [
  { label: 'Schedule Pickup', href: '/requests/new', desc: 'Book a collection for your devices' },
  { label: 'My Requests', href: '/requests', desc: 'Track pending and completed pickups' },
  { label: 'Accepted Items', href: '/#pricing', desc: 'Laptops, phones, batteries & servers' },
]

const collectorLinks: NavDropdownItem[] = [
  { label: 'Pickup Dashboard', href: '/requests', desc: 'View pending requests in your area' },
  { label: 'Assigned Routes', href: '/requests', desc: 'Active collections assigned to you' },
  { label: 'Coverage Areas', href: '/areas', desc: 'Supported municipal zones' },
]

const recyclerLinks: NavDropdownItem[] = [
  { label: 'Facility Inbound', href: '/requests', desc: 'Verified shipments received' },
  { label: 'Recycling Partners', href: '/areas', desc: 'Certified e-waste processing hubs' },
  { label: 'Compliance & Audit', href: '/#compliance', desc: 'Zero-landfill certs & reports' },
]

export const PillNav: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<'requester' | 'collector' | 'recycler' | 'mobile' | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMenu = (menu: 'requester' | 'collector' | 'recycler') => {
    setActiveMenu((prev) => (prev === menu ? null : menu))
  }

  const renderDropdown = (items: NavDropdownItem[], title: string) => {
    return (
      <div
        className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[280px] p-3 rounded-[20px] shadow-2xl backdrop-blur-xl border border-white/10 select-none animate-in fade-in zoom-in-95 duration-180"
        style={{
          backgroundColor: 'rgba(11, 11, 20, 0.94)',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          borderRadius: 'var(--r-card)',
          zIndex: 100,
        }}
      >
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/40">
          {title}
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setActiveMenu(null)}
              className="flex items-center justify-between p-2.5 rounded-[12px] hover:bg-white/10 transition-colors group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#FFA05A] transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-white/50">{item.desc}</div>
              </div>
              <ArrowUpRight size={14} className="text-white/40 group-hover:text-[#FFA05A] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main Floating Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 h-[64px] min-w-[320px] max-w-[580px] w-[90vw] md:w-[32vw] rounded-[999px] shadow-2xl border border-white/10"
      style={{
        backgroundColor: 'rgba(11, 11, 20, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 'var(--r-pill)',
        boxShadow: '0 20px 45px rgba(11, 11, 20, 0.35)',
      }}
    >
      {/* Left: Round Home Button (44px) */}
      <Link
        to="/"
        aria-label="EcoTrack Home"
        className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
        }}
      >
        <Home size={19} className="text-white" />
      </Link>

      {/* Desktop Menu Items */}
      <div className="hidden md:flex items-center gap-1">
        {/* Requesters Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('requester')}
            aria-expanded={activeMenu === 'requester'}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-[999px] transition-all duration-[180ms]"
          >
            <span>Requesters</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-[180ms] ${
                activeMenu === 'requester' ? 'rotate-180 text-[#FFA05A]' : 'text-white/60'
              }`}
            />
          </button>
          {activeMenu === 'requester' && renderDropdown(requesterLinks, 'For Requesters')}
        </div>

        {/* Collectors Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('collector')}
            aria-expanded={activeMenu === 'collector'}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-[999px] transition-all duration-[180ms]"
          >
            <span>Collectors</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-[180ms] ${
                activeMenu === 'collector' ? 'rotate-180 text-[#FFA05A]' : 'text-white/60'
              }`}
            />
          </button>
          {activeMenu === 'collector' && renderDropdown(collectorLinks, 'For Collectors')}
        </div>

        {/* Recyclers Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('recycler')}
            aria-expanded={activeMenu === 'recycler'}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-[999px] transition-all duration-[180ms]"
          >
            <span>Recyclers</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-[180ms] ${
                activeMenu === 'recycler' ? 'rotate-180 text-[#FFA05A]' : 'text-white/60'
              }`}
            />
          </button>
          {activeMenu === 'recycler' && renderDropdown(recyclerLinks, 'For Recyclers')}
        </div>
      </div>

      {/* Mobile Drawer Button */}
      <div className="md:hidden relative">
        <button
          onClick={() => setActiveMenu(activeMenu === 'mobile' ? null : 'mobile')}
          className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 rounded-[999px]"
        >
          {activeMenu === 'mobile' ? <X size={16} /> : <Menu size={16} />}
          <span>Menu</span>
        </button>

        {activeMenu === 'mobile' && (
          <div
            className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[310px] p-4 rounded-[20px] shadow-2xl backdrop-blur-xl border border-white/10"
            style={{
              backgroundColor: 'rgba(11, 11, 20, 0.95)',
              color: '#FFFFFF',
              borderRadius: 'var(--r-card)',
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#FFA05A]">Navigation</div>
              <Link
                to="/requests"
                onClick={() => setActiveMenu(null)}
                className="text-sm font-semibold py-1 hover:text-[#FFA05A]"
              >
                Pickup Requests
              </Link>
              <Link
                to="/requests/new"
                onClick={() => setActiveMenu(null)}
                className="text-sm font-semibold py-1 hover:text-[#FFA05A]"
              >
                Schedule Pickup
              </Link>
              <Link
                to="/areas"
                onClick={() => setActiveMenu(null)}
                className="text-sm font-semibold py-1 hover:text-[#FFA05A]"
              >
                Service Areas
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right: Cantaloupe Sign In or User Dashboard Pill */}
      {user ? (
        <div className="flex items-center gap-1.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[999px] text-[#0B0B14] bg-[#FFA05A] hover:bg-[#ff9142] transition-transform active:scale-95 shadow-sm"
            style={{ borderRadius: 'var(--r-pill)' }}
          >
            <User size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            title="Log out"
            aria-label="Log out"
            className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 text-xs md:text-sm font-semibold rounded-[999px] text-[#0B0B14] bg-[#FFA05A] hover:bg-[#ff9142] transition-transform active:scale-95 shadow-sm whitespace-nowrap"
          style={{ borderRadius: 'var(--r-pill)' }}
        >
          Sign in
        </Link>
      )}
    </nav>
  )
}

