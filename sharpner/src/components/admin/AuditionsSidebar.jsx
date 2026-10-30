import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../app/authContext.js";
import {
  getNavigationItemsForRole,
  isAdminNavigationItemActive,
} from "../layout/adminNavigation.js";

export default function AuditionsSidebar({ isOpen, onClose, onToggle }) {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigationItems = getNavigationItemsForRole(user);

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await logout();
      } catch {
        window.alert("Unable to sign out right now. Please try again.");
      }
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
          {navigationItems.map((item) => (
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
