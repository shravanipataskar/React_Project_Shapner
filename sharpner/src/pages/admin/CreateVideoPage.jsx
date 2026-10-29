
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/pages/CreateVideoPage.css";

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

export default function CreateVideoPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    videoUrl: "",
    contentType: "Video",
    displayOrder: "0",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    window.alert(
      "Form UI is ready. Database integration is not connected yet."
    );
  };

  const handleCancel = () => {
    navigate("/admin/videos");
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      navigate("/login");
    }
  };

  return (
    <div className="sharpner-create-video">
      <button
        className="create-video-mobile-toggle"
        type="button"
        onClick={() => setSidebarOpen((previous) => !previous)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          className="create-video-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`create-video-sidebar ${
          sidebarOpen ? "create-video-sidebar-open" : ""
        }`}
      >
        <div className="create-video-sidebar-brand">
          <Link to="/dashboard">SHARPNER</Link>
        </div>

        <nav className="create-video-navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`create-video-nav-link ${
                item.path === "/admin/videos"
                  ? "create-video-nav-active"
                  : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="create-video-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            type="button"
            className="create-video-signout"
            onClick={handleSignOut}
          >
            <span>⇥</span>
            Sign Out
          </button>
        </nav>
      </aside>

      <main className="create-video-main">
        <header className="create-video-header">
          <h1>
            <span className="create-video-heading-icon">➕</span>
            Add New Video / Short
          </h1>
        </header>

        <section className="create-video-card">
          <form onSubmit={handleSubmit}>
            <div className="create-video-field">
              <label htmlFor="videoUrl">
                Video URL (YouTube / Instagram)
              </label>

              <input
                id="videoUrl"
                name="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/... or https://instagram.com/..."
                required
              />
            </div>

            <div className="create-video-field">
              <label htmlFor="contentType">Content Type</label>

              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
              >
                <option value="Video">Video</option>
                <option value="Short">Short</option>
              </select>
            </div>

            <div className="create-video-field">
              <label htmlFor="displayOrder">Display Order</label>

              <input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-video-actions">
              <button type="submit" className="create-video-save">
                <span>ϟ</span>
                Save Content
              </button>

              <button
                type="button"
                className="create-video-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

