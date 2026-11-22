// src/components/Layout.tsx
import React from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { IconDashboard, IconPackage, IconMap, IconLogout, IconRecycle } from './Icons'

export const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return { title: 'Dashboard', subtitle: 'Overview of your e-waste activity' }
      case '/requests':
        return { title: 'Pickup Requests', subtitle: 'Manage waste collection requests' }
      case '/requests/new':
        return { title: 'New Request', subtitle: 'Submit a new waste pickup request' }
      case '/areas':
        return { title: 'Service Areas', subtitle: 'Regions available for waste pickup' }
      default:
        return { title: 'EcoTrack', subtitle: 'E-Waste Management Platform' }
    }
  }

  const { title, subtitle } = getPageInfo()
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/dashboard" className="sidebar-logo" style={{ textDecoration: 'none' }}>
          <IconRecycle />
          <div>
            <h1>EcoTrack</h1>
            <span>E-Waste Platform</span>
          </div>
        </Link>

        <span className="nav-section-label">Navigation</span>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-dashboard"
          end
        >
          <IconDashboard /> Dashboard
        </NavLink>

        <NavLink
          to="/requests"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-requests"
        >
          <IconPackage /> Pickup Requests
        </NavLink>

        <NavLink
          to="/areas"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          id="nav-areas"
        >
          <IconMap /> Service Areas
        </NavLink>

        <div className="sidebar-spacer" />

        <span className="nav-section-label">Account</span>
        <div
          style={{
            padding: '12px 14px',
            fontSize: '13px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--r-card)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '8px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-all' }}>{user.email}</div>
          <div
            style={{
              color: '#FFA05A',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginTop: '4px',
            }}
          >
            {user.role}
          </div>
        </div>

        <button
          id="nav-logout"
          className="nav-item"
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            color: '#A0A0B0',
          }}
          onClick={logout}
        >
          <IconLogout /> Sign out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            <div className="topbar-subtitle">{subtitle}</div>
          </div>
          <div className="topbar-actions">
            <Link
              to="/"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                marginRight: '8px',
              }}
            >
              Public View ↗
            </Link>
            <div className="avatar" title={user.email}>
              {initials}
            </div>
          </div>
        </header>

        <div className="content page-fade" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
