import { Link } from "react-router-dom";

const navigationItems = [
  { icon: "▦", label: "Dashboard", path: "/dashboard" },
  { icon: "▣", label: "Videos & Shorts", path: "/admin/videos" },
  { icon: "☻", label: "Auditions", path: "/admin/auditions" },
  { icon: "⊕", label: "Dhol Pathak", path: "/admin/dhol-pathak" },
  { icon: "☆", label: "Talent Show", path: "/admin/talent-shows" },
  { icon: "ⓘ", label: "Creative Ideas", path: "/admin/creative-ideas" },
  { icon: "♙", label: "Brand Deals", path: "/admin/brand-deals" },
  { icon: "▤", label: "Tickets", path: "/admin/tickets" },
  { icon: "♧", label: "Users", path: "/admin/users" },
];

export default function AuditionsSidebar({ isOpen, onClose, onToggle }) {
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
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`auditions-nav-link ${
                item.path === "/admin/auditions"
                  ? "auditions-nav-active"
                  : ""
              }`}
            >
              <span className="auditions-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
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
