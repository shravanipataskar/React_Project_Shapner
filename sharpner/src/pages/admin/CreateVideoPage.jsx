
import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { videosApi } from "../../services/api";
import { useAuth } from "../../app/authContext.js";
import { getVideoMetadata } from "../../services/videoMetadata.js";
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from "../../components/layout/adminNavigation.js";
import "../../styles/pages/CreateVideoPage.css";

export default function CreateVideoPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    videoUrl: "",
    contentType: "Video",
    displayOrder: "0",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSubmitError("");

    const videoUrl = formData.videoUrl.trim();
    let metadata;

    try {
      metadata = getVideoMetadata(videoUrl);
    } catch (error) {
      setSubmitError(error.message);
      setSaving(false);
      return;
    }

    const video = {
      ...metadata,
      video_url: videoUrl,
      type: formData.contentType.toLowerCase(),
      display_order: Number(formData.displayOrder),
      status: 1,
    };

    try {
      await videosApi.create(video);
      navigate("/admin/videos", {
        state: { notice: "Video content was saved successfully." },
      });
    } catch (error) {
      console.error("Failed to save video to the server:", error);
      setSubmitError(
        error.status >= 500
          ? "Unable to save this video. Please try again."
          : error.message || "Unable to save this video. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/videos");
  };

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
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `create-video-nav-link ${
                  isActive || isAdminNavigationItemActive(item, pathname)
                    ? "create-video-nav-active"
                    : ""
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="create-video-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
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
            {submitError && (
              <p className="create-video-error" role="alert">
                {submitError}
              </p>
            )}
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
              <button
                type="submit"
                className="create-video-save"
                disabled={saving}
              >
                <span>ϟ</span>
                {saving ? "Saving..." : "Save Content"}
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
