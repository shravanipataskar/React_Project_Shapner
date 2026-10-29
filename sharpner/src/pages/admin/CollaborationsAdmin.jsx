import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { downloadCsv } from "../../utils/downloadCsv.js";
import { downloadPdf } from "../../utils/downloadPdf.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/CollaborationsAdmin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const CollaborationsAdmin = () => {
  const { pathname } = useLocation();
  const isInactivePage = pathname.endsWith("/inactive");
  const activeFilter = isInactivePage ? "inactive" : "active";
  const [collaborations, setCollaborations] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // FETCH COLLABORATIONS
  // ----------------------------------------------------
  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/collaborations`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      console.log("Collaborations API response:", result);

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

            <Link
              className={`talent-show-button talent-show-button-inactive${
                activeFilter === "inactive" ? " is-selected" : ""
              }`}
              to="/admin/collaborations/inactive"
            >
              ⏸ Inactive
            </Link>

            {!isInactivePage && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/collaborations/create"
              >
                ＋ Add New
              </Link>
            )}

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
                            <button
                              type="button"
                              className="talent-show-button talent-show-button-view"
                              disabled
                              title="Brand Deal details are not available yet."
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="talent-show-button talent-show-button-edit"
                              disabled
                              title="Brand Deal editing is not available yet."
                            >
                              Edit
                            </button>
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