import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from './adminNavigation.js'
import '../../styles/pages/Dashboard.css'

function AdminLayout({ children, pageClass = '' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  function handleSignOut() {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (confirmed) {
      window.location.href = '/login'
    }
  }

  return (
    <div className={`sharpner-dashboard ${pageClass}`.trim()}>
      <button
        type="button"
        className="dashboard-mobile-toggle"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`dashboard-sidebar${sidebarOpen ? ' dashboard-sidebar-open' : ''}`}
      >
        <div className="dashboard-sidebar-brand">
          <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>
            SHARPNER
          </Link>
        </div>

        <nav className="dashboard-navigation" aria-label="Admin navigation">
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={
                item.path !== '/admin/talent-shows' &&
                item.path !== '/admin/ideas' &&
                item.path !== '/admin/collaborations' &&
                item.path !== '/admin/tickets' &&
                item.path !== '/admin/users'
              }
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => {
                const active =
                  isActive || isAdminNavigationItemActive(item, pathname)
                return `dashboard-nav-link${active ? ' dashboard-nav-active' : ''}`
              }}
            >
              <span className="dashboard-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            className="dashboard-signout"
            onClick={handleSignOut}
          >
            <span aria-hidden="true">⇥</span>
            Sign Out
          </button>
        </nav>
      </aside>

      {children}
    </div>
  )
}

export default AdminLayout
