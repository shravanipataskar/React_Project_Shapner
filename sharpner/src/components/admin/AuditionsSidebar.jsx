import { Link, NavLink, useLocation } from "react-router-dom";
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from "../layout/adminNavigation.js";

export default function AuditionsSidebar({ isOpen, onClose, onToggle }) {
  const { pathname } = useLocation();

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <button
        className="auditions-mobile-toggle"
        type="button"
        onClick={onToggle}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        ☰
      </button>

      {isOpen && (
        <button
          className="auditions-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`auditions-sidebar ${
          isOpen ? "auditions-sidebar-open" : ""
        }`}
      >
        <div className="auditions-sidebar-brand">
          <Link to="/dashboard" onClick={onClose}>
            SHARPNER
          </Link>
        </div>

        <nav className="auditions-navigation">
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `auditions-nav-link ${
                  isActive || isAdminNavigationItemActive(item, pathname)
                    ? "auditions-nav-active"
                    : ""
                }`
              }
            >
              <span className="auditions-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className="auditions-signout"
            onClick={handleSignOut}
          >
            <span>⇥</span>
            Sign Out
          </button>
        </nav>
      </aside>
    </>
  );
}
