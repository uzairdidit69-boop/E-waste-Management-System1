// src/components/Layout.tsx
import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { IconDashboard, IconPackage, IconMap, IconLogout, IconRecycle } from './Icons'

export const Layout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) return null

  const getPageInfo = () => {
    switch (location.pathname) {
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
        <div className="sidebar-logo">
          <IconRecycle />
          <div>
            <h1>EcoTrack</h1>
            <span>E-Waste Platform</span>
          </div>
        </div>

        <span className="nav-section-label">Navigation</span>

        <NavLink
          to="/"
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
        <div style={{ padding: '8px 14px', fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{user.email}</div>
          <div style={{ color: 'var(--color-primary)', fontSize: 12, textTransform: 'capitalize', marginTop: 2 }}>
            {user.role}
          </div>
        </div>

        <button
          id="nav-logout"
          className="nav-item"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
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
            <div className="avatar" title={user.email}>{initials}</div>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
