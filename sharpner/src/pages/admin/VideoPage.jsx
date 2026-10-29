
import React, { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { videosApi } from "../../services/api";
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from "../../components/layout/adminNavigation.js";
import "../../styles/pages/VideosPage.css";

export default function VideosPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const statusFilter = location.pathname.endsWith("/inactive")
    ? "Inactive"
    : "Active";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    video_url: "",
    type: "video",
    display_order: "0",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingVideoId, setUpdatingVideoId] = useState(null);

  // Load videos from the Laravel API.
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await videosApi.getAll({
        status: statusFilter === "Active" ? 1 : 0,
      });

      // Laravel pagination returns records inside response.data.
      const records = Array.isArray(response?.data)
        ? response.data
        : [];

      setVideos(records);
    } catch (err) {
      console.error("Failed to load videos:", err);
      setVideos([]);
      setError(
        err.message ||
          "Unable to load videos. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Search the currently loaded records.
  const filteredVideos = videos.filter((video) => {
    const search = searchInput.trim().toLowerCase();

    if (!search || statusFilter === "Inactive") {
      return true;
    }

    return (
      String(video.title || "").toLowerCase().includes(search) ||
      String(video.platform || "").toLowerCase().includes(search) ||
      String(video.type || "").toLowerCase().includes(search)
    );
  });

  const resetFilters = () => {
    setSearchInput("");
  };

  const openEdit = (video) => {
    setEditingVideo(video);
    setEditForm({
      video_url: video.video_url || "",
      type: String(video.type || "video").toLowerCase(),
      display_order: String(video.display_order ?? 0),
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSavingEdit(true);
    setError("");

    try {
      await videosApi.update(editingVideo.id, {
        video_url: editForm.video_url,
        type: editForm.type,
        display_order: Number(editForm.display_order),
      });
      setEditingVideo(null);
      await loadVideos();
    } catch (err) {
      console.error("Failed to update video:", err);
      setError(
        err.message || "Unable to update this video. Please try again."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const updateVideoStatus = async (video) => {
    const activating = statusFilter === "Inactive";
    const action = activating ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} this video?`)) {
      return;
    }

    setUpdatingVideoId(video.id);
    setError("");

    try {
      await videosApi.update(video.id, { status: activating ? 1 : 0 });
      await loadVideos();
    } catch (err) {
      console.error(`Failed to ${action} video:`, err);
      setError(
        err.message || `Unable to ${action} this video. Please try again.`
      );
    } finally {
      setUpdatingVideoId(null);
    }
  };

  const handleSignOut = () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");

    if (confirmed) {
      navigate("/login");
    }
  };

  return (
    <div
      className={`sharpner-videos-page${
        statusFilter === "Inactive" ? " is-inactive" : ""
      }`}
    >
      {/* Mobile navigation toggle */}
      <button
        className="videos-mobile-toggle"
        type="button"
        onClick={() => setSidebarOpen((previous) => !previous)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="videos-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`videos-sidebar ${
          sidebarOpen ? "videos-sidebar-open" : ""
        }`}
      >
        <div className="videos-sidebar-brand">
          <Link to="/dashboard">SHARPNER</Link>
        </div>

        <nav className="videos-navigation">
          {adminNavigationItems.map((item) => {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `videos-nav-link ${
                    isActive ||
                    isAdminNavigationItemActive(item, location.pathname)
                      ? "videos-nav-active"
                      : ""
                  }`
                }
              >
                <span className="videos-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            className="videos-signout"
            onClick={handleSignOut}
          >
            <span className="videos-signout-icon">⇥</span>
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="videos-main">
        {/* Header */}
        <header className="videos-header">
          <h1>
            <span className="videos-heading-icon">
              {statusFilter === "Inactive" ? "⏸️" : "🎥"}
            </span>
            <span>
              {statusFilter === "Inactive"
                ? "Inactive Videos & Shorts"
                : "Manage Videos & Shorts"}
            </span>
          </h1>

          <div className="videos-header-actions">
            <Link
              to="/admin/videos"
              className={`videos-status-button videos-active-button ${
                statusFilter === "Active" ? "status-active" : ""
              }`}
              aria-current={statusFilter === "Active" ? "page" : undefined}
            >
              ☑ Active
            </Link>

            <Link
              to="/admin/videos/inactive"
              className={`videos-status-button videos-inactive-button ${
                statusFilter === "Inactive" ? "status-inactive" : ""
              }`}
              aria-current={statusFilter === "Inactive" ? "page" : undefined}
            >
              ⏸ Inactive
            </Link>

            <Link to="/videos/create" className="videos-add-new-link">
              <span>＋</span>
              Add New
            </Link>
          </div>
        </header>

        {/* Search and table container */}
        <section className="videos-content-card">
          {/* Search form */}
          {statusFilter === "Active" && (
            <form
              className="videos-search-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search..."
                aria-label="Search videos"
              />

              <button type="submit" className="videos-search-button">
                <span className="videos-search-icon">⌕</span>
                Search
              </button>

              <button
                type="button"
                className="videos-reset-button"
                onClick={resetFilters}
              >
                <span>×</span>
                Reset
              </button>
            </form>
          )}

          {/* Error message */}
          {error && (
            <div role="alert" className="videos-error-message">
              <p>{error}</p>

              <button type="button" onClick={loadVideos}>
                Retry
              </button>
            </div>
          )}

          {/* Video table */}
          <div className="videos-table-wrapper">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Type</th>
                  {statusFilter === "Active" && <th>Order</th>}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={statusFilter === "Active" ? 6 : 5}
                      className="videos-empty-state"
                    >
                      Loading videos...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={statusFilter === "Active" ? 6 : 5}
                      className="videos-empty-state"
                    >
                      Videos could not be loaded.
                    </td>
                  </tr>
                ) : filteredVideos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={statusFilter === "Active" ? 6 : 5}
                      className="videos-empty-state"
                    >
                      {searchInput.trim()
                        ? "No videos match your search."
                        : `No ${statusFilter.toLowerCase()} videos available.`}
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((video) => (
                    <tr key={video.id}>
                      <td className="videos-thumbnail-cell">
                        {video.thumbnail ? (
                          <img
                            className="videos-thumbnail"
                            src={video.thumbnail}
                            alt={video.title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.hidden = true;
                            }}
                          />
                        ) : null}
                      </td>

                      <td className="videos-title-cell">{video.title}</td>

                      <td>
                        <span className="videos-platform-badge">
                          {String(video.platform || "—").toLowerCase() ===
                          "youtube"
                            ? "YouTube"
                            : String(video.platform || "—").toLowerCase() ===
                                "instagram"
                              ? "Instagram"
                              : video.platform || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="videos-type-badge">
                          {String(video.type || "video").toLowerCase() ===
                          "short"
                            ? "Short"
                            : String(video.type || "video")
                                .charAt(0)
                                .toUpperCase() +
                              String(video.type || "video").slice(1)}
                        </span>
                      </td>

                      {statusFilter === "Active" && (
                        <td className="videos-order-cell">
                          {video.display_order ?? 0}
                        </td>
                      )}

                      <td>
                        <div className="videos-row-actions">
                          {video.video_url ? (
                            <a
                              className="videos-view-button"
                              href={video.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open ${video.title}`}
                            >
                              View
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                          {statusFilter === "Active" && (
                            <button
                              type="button"
                              className="videos-edit-button"
                              onClick={() => openEdit(video)}
                              disabled={updatingVideoId !== null}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className={
                              statusFilter === "Inactive"
                                ? "videos-activate-button"
                                : "videos-deactivate-button"
                            }
                            onClick={() => updateVideoStatus(video)}
                            disabled={updatingVideoId === video.id}
                          >
                            {updatingVideoId === video.id
                              ? "Saving..."
                              : statusFilter === "Active"
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Result count */}
          {statusFilter === "Active" && <div className="videos-result-count">
            {loading
              ? "Loading results..."
              : `Showing ${filteredVideos.length} of ${videos.length} ${
                  statusFilter === "Active" ? "active" : "inactive"
                } videos`}
          </div>}
        </section>
      </main>

      {editingVideo && (
        <div
          className="videos-edit-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingEdit) {
              setEditingVideo(null);
            }
          }}
        >
          <section
            className="videos-edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="videos-edit-title"
          >
            <h2 id="videos-edit-title">Edit Video / Short</h2>
            <form onSubmit={saveEdit}>
              <label htmlFor="videos-edit-url">Video URL</label>
              <input
                id="videos-edit-url"
                type="url"
                value={editForm.video_url}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    video_url: event.target.value,
                  }))
                }
                required
              />
              <label htmlFor="videos-edit-type">Content Type</label>
              <select
                id="videos-edit-type"
                value={editForm.type}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                <option value="video">Video</option>
                <option value="short">Short</option>
              </select>
              <label htmlFor="videos-edit-order">Display Order</label>
              <input
                id="videos-edit-order"
                type="number"
                min="0"
                value={editForm.display_order}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    display_order: event.target.value,
                  }))
                }
                required
              />
              {error && <p role="alert" className="videos-edit-error">{error}</p>}
              <div className="videos-edit-actions">
                <button type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
