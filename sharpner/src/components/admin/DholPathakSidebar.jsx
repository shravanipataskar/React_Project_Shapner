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

export default function DholPathakSidebar({ isOpen, onClose, onToggle }) {
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
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`dhol-nav-link ${
                item.path === "/admin/dhol-pathak" ? "dhol-nav-active" : ""
              }`}
            >
              <span className="dhol-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
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
