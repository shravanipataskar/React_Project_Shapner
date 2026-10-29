import { Link, NavLink, useLocation } from "react-router-dom";
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from "../layout/adminNavigation.js";

export default function DholPathakSidebar({ isOpen, onClose, onToggle }) {
  const { pathname } = useLocation();

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <button
        type="button"
        className="dhol-mobile-toggle"
        onClick={onToggle}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        ☰
      </button>

      {isOpen && (
        <button
          type="button"
          className="dhol-sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`dhol-sidebar ${isOpen ? "dhol-sidebar-open" : ""}`}>
        <div className="dhol-sidebar-brand">
          <Link to="/dashboard" onClick={onClose}>
            SHARPNER
          </Link>
        </div>

        <nav className="dhol-navigation">
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `dhol-nav-link ${
                  isActive || isAdminNavigationItemActive(item, pathname)
                    ? "dhol-nav-active"
                    : ""
                }`
              }
            >
              <span className="dhol-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            className="dhol-signout"
            onClick={handleSignOut}
          >
            <span className="dhol-signout-icon">⇥</span>
            Sign Out
          </button>
        </nav>
      </aside>
    </>
  );
}
