import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { downloadCsv } from "../../utils/downloadCsv.js";
import { downloadPdf } from "../../utils/downloadPdf.js";
import { collaborationsApi } from "../../services/collaborationsApi.js";
import { useAuth } from "../../app/authContext.js";
import { hasSuperAdminAccess } from "../../utils/userTypes.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/CollaborationsAdmin.css";

const CollaborationsAdmin = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInactivePage = pathname.endsWith("/inactive");
  const activeFilter = isInactivePage ? "inactive" : "active";
  
  // Role-based access control - Only Super Admin can edit
  const canEdit = hasSuperAdminAccess(user);
  const isAdmin = !canEdit; // Everyone else is view-only
  
  const [collaborations, setCollaborations] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingIds, setChangingIds] = useState([]);

  // Redirect admin users away from inactive page
  useEffect(() => {
    if (isAdmin && isInactivePage) {
      navigate('/admin/collaborations', { replace: true });
    }
  }, [isAdmin, isInactivePage, navigate]);

  // ----------------------------------------------------
  // FETCH COLLABORATIONS
  // ----------------------------------------------------
  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await collaborationsApi.getAll();

      if (result.success && Array.isArray(result.data)) {
        setCollaborations(result.data);
      } else if (Array.isArray(result.data)) {
        setCollaborations(result.data);
      } else if (Array.isArray(result)) {
        setCollaborations(result);
      } else {
        setCollaborations([]);
        setError("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Failed to fetch collaborations:", err);
      setError(
        err.message ||
          "Unable to fetch collaborations. Please check the Laravel server."
      );
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // LOAD DATA
  // ----------------------------------------------------
  useEffect(() => {
    fetchCollaborations();
  }, []);

  const handleStatusChange = async (item) => {
    const nextStatus = Number(item.status) === 1 ? 0 : 1;
    const action = nextStatus === 1 ? "activate" : "deactivate";
    const confirmation =
      nextStatus === 1
        ? "Are you sure you want to activate this brand deal?"
        : "Are you sure you want to deactivate this brand deal?";

    if (!window.confirm(confirmation)) {
      return;
    }

    setError("");
    setChangingIds((previous) => [...previous, item.id]);

    try {
      await collaborationsApi.updateStatus(item.id, nextStatus);
      setCollaborations((previous) =>
        previous.map((collaboration) =>
          collaboration.id === item.id
            ? { ...collaboration, status: nextStatus }
            : collaboration,
        ),
      );
    } catch (requestError) {
      console.error(`Failed to ${action} Brand Deal:`, requestError);
      setError(
        requestError.message || `Unable to ${action} this Brand Deal.`,
      );
    } finally {
      setChangingIds((previous) =>
        previous.filter((id) => id !== item.id),
      );
    }
  };

  // ----------------------------------------------------
  // SEARCH + STATUS FILTER
  // ----------------------------------------------------
  const filteredCollaborations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return collaborations.filter((item) => {
      // Active / inactive
      const isActive = Number(item.status) === 1;

      if (activeFilter === "active" && !isActive) {
        return false;
      }

      if (activeFilter === "inactive" && isActive) {
        return false;
      }

      // Search
      if (!searchText) {
        return true;
      }

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.contact_person || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.brand_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.organization_name || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [collaborations, search, activeFilter]);

  // ----------------------------------------------------
  // RESET
  // ----------------------------------------------------
  const handleReset = () => {
    setSearch("");
  };

  const exportCollaborations = () => {
    const rows = filteredCollaborations.map((item) => [
      item.brand_name || item.organization_name || "",
      item.contact_person || item.name || "",
      item.email || "",
      getReviewStatus(item.review_status).text,
    ]);

    downloadCsv(
      "brand-deals.csv",
      ["Brand Name", "Contact Person", "Email", "Review Status"],
      rows,
    );
  };

  const exportCollaborationsPdf = async () => {
    const rows = filteredCollaborations.map((item) => [
      item.brand_name || item.organization_name || "",
      item.contact_person || item.name || "",
      item.email || "",
      getReviewStatus(item.review_status).text,
    ]);

    try {
      await downloadPdf(
        "brand-deals.pdf",
        "Brand Deals",
        ["Brand Name", "Contact Person", "Email", "Review Status"],
        rows,
      );
    } catch (exportError) {
      console.error("Failed to export brand deals as PDF:", exportError);
      setError("Unable to export brand deals as PDF. Please try again.");
    }
  };

  // ----------------------------------------------------
  // REVIEW STATUS
  // ----------------------------------------------------
  const getReviewStatus = (value) => {
    const status = Number(value);

    if (status === 1) {
      return {
        text: "Reviewed",
        className: "review-approved",
      };
    }

    if (status === 2) {
      return {
        text: "Rejected",
        className: "review-rejected",
      };
    }

    return {
      text: "Pending",
      className: "review-pending",
    };
  };

  return (
    <AdminLayout
      pageClass={`collaborations-admin${isInactivePage ? " is-inactive" : ""}`}
    >
      <main className="dashboard-main collaborations-main">
        <header className="collaborations-header">
          <h1>
            <span aria-hidden="true">{isInactivePage ? "⏸️" : "🤝"}</span>
            {isInactivePage ? "Inactive Brand Deals" : "Manage Brand Deals"}
          </h1>

          <div className="collaborations-toolbar" aria-label="Brand Deal actions">
            <Link
              className={`talent-show-button talent-show-button-active${
                activeFilter === "active" ? " is-selected" : ""
              }`}
              to="/admin/collaborations"
            >
              ✅ Active
            </Link>

            {/* Inactive tab - Only Super Admin */}
            {canEdit && (
              <Link
                className={`talent-show-button talent-show-button-inactive${
                  activeFilter === "inactive" ? " is-selected" : ""
                }`}
                to="/admin/collaborations/inactive"
              >
                ⏸ Inactive
              </Link>
            )}

            {canEdit && !isInactivePage && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/collaborations/create"
              >
                ＋ Add New
              </Link>
            )}

            {/* Export buttons - Both Admin and Super Admin */}
            {!isInactivePage && (
              <>
                <button
                  type="button"
                  className="talent-show-button talent-show-button-excel"
                  onClick={exportCollaborations}
                  disabled={loading || filteredCollaborations.length === 0}
                >
                  📊 Export Excel
                </button>

                <button
                  type="button"
                  className="talent-show-button talent-show-button-pdf"
                  onClick={exportCollaborationsPdf}
                  disabled={loading || filteredCollaborations.length === 0}
                >
                  📄 Export PDF
                </button>
              </>
            )}
          </div>
        </header>

        <section
          className="talent-show-card collaborations-card"
          aria-label="Brand Deals"
        >
          <form
            className="talent-show-search collaborations-search"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(search.trim());
            }}
            role="search"
          >
            <label className="talent-show-sr-only" htmlFor="brand-deals-search">
              Search Brand Deals
            </label>
            <input
              id="brand-deals-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by contact person or email..."
            />

            <button
              type="button"
              className="talent-show-button talent-show-button-search"
              onClick={() => setSearch(search.trim())}
            >
              🔍 Search
            </button>

            <button
              type="button"
              className="talent-show-button talent-show-button-reset"
              onClick={handleReset}
            >
              ✕ Reset
            </button>
          </form>

          {error && (
            <div className="talent-show-data-message is-error" role="alert">
              {error}
            </div>
          )}

          <div className="talent-show-table-scroll collaborations-table-scroll">
            <table className="talent-show-table collaborations-table">
              <thead>
                <tr>
                  <th scope="col">Brand Name</th>
                  <th scope="col">Contact Person</th>
                  <th scope="col">Email</th>
                  <th scope="col">Review Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="talent-show-empty" colSpan="5">
                      Loading brand deals...
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredCollaborations.length === 0 && (
                  <tr>
                    <td className="talent-show-empty" colSpan="5">
                      No brand deals found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredCollaborations.map((item) => {
                    const reviewStatus = getReviewStatus(item.review_status);

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {item.brand_name || item.organization_name || "—"}
                          </strong>
                        </td>
                        <td>{item.contact_person || item.name || "—"}</td>
                        <td>{item.email || "—"}</td>
                        <td>
                          <span className="collaborations-status">
                            {reviewStatus.text}
                          </span>
                        </td>
                        <td>
                          <div className="talent-show-row-actions">
                            <Link
                              className="talent-show-button talent-show-button-view"
                              to={`/admin/collaborations/${encodeURIComponent(item.id)}`}
                            >
                              View
                            </Link>
                            {/* Edit - Only Super Admin */}
                            {canEdit && !isInactivePage && (
                              <Link
                                className="talent-show-button talent-show-button-edit"
                                to={`/admin/collaborations/${encodeURIComponent(item.id)}/edit`}
                              >
                                Edit
                              </Link>
                            )}
                            {/* Deactivate/Activate - Only Super Admin */}
                            {canEdit && (
                              <button
                                type="button"
                                className={`talent-show-button ${
                                  isInactivePage
                                    ? "talent-show-button-activate"
                                    : "talent-show-button-deactivate"
                                }`}
                                onClick={() => handleStatusChange(item)}
                                disabled={changingIds.includes(item.id)}
                              >
                                {changingIds.includes(item.id)
                                  ? "Saving..."
                                  : isInactivePage
                                    ? "Activate"
                                    : "Deactivate"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!loading && filteredCollaborations.length > 0 && (
            <div className="talent-show-results-count">
              Showing {filteredCollaborations.length} of{" "}
              {collaborations.length} brand deals
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  );
};

export default CollaborationsAdmin;