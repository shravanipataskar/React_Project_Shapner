import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/pages/AuditionsPage.css";
import { auditionsApi } from "../../services/auditionsApi";
import AuditionsSidebar from "../../components/admin/AuditionsSidebar.jsx";
import { useAuth } from "../../app/authContext.js";
import { hasSuperAdminAccess } from "../../utils/userTypes.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AuditionsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const status = pathname.endsWith("/inactive") ? "Inactive" : "Active";

  // Only Super Admin can edit
  const canEdit = hasSuperAdminAccess(user);
  const isAdmin = !canEdit; // Everyone else is view-only

  // Redirect admin users away from inactive page
  useEffect(() => {
    if (isAdmin && status === "Inactive") {
      navigate("/admin/auditions", { replace: true });
    }
  }, [isAdmin, status, navigate]);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // API data states
  const [auditions, setAuditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [changingAuditionIds, setChangingAuditionIds] = useState([]);

  // Pagination data returned by Laravel
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  /**
   * Fetch auditions from the Laravel backend.
   *
   * Expected API:
   * GET /api/auditions?status=1&search=&page=1
   */
  const fetchAuditions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await auditionsApi.getAll({
        status: status === "Active" ? 1 : 0,
        search: submittedSearch,
        page: currentPage,
      });

      // Laravel pagination response contains a data array.
      const records = Array.isArray(result.data) ? result.data : [];

      setAuditions(records);

      setPagination({
        current_page: result.current_page ?? currentPage,
        last_page: result.last_page ?? 1,
        per_page: result.per_page ?? 10,
        total: result.total ?? records.length,
      });
    } catch (err) {
      console.error("Failed to load auditions:", err);

      setAuditions([]);

      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      });

      setError(
        err.message || "Unable to load audition applications."
      );
    } finally {
      setLoading(false);
    }
  }, [status, submittedSearch, currentPage]);

  // Fetch records when filters or the current page change.
  useEffect(() => {
    fetchAuditions();
  }, [fetchAuditions]);

  // Search form submission
  const handleSearch = (event) => {
    event.preventDefault();

    setCurrentPage(1);
    setSubmittedSearch(search.trim());
  };

  // Reset search and filters
  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setCurrentPage(1);
  };

  const handleViewAudition = (audition) => {
    navigate(`/admin/auditions/${encodeURIComponent(audition.id)}`);
  };

  const handleStatusChange = async (audition) => {
    const nextStatus = status === "Active" ? 0 : 1;
    if (
      nextStatus === 0 &&
      !window.confirm(
        `Are you sure you want to deactivate the audition for ${
          audition.full_name || "this applicant"
        }?`
      )
    ) {
      return;
    }

    setActionError("");
    setChangingAuditionIds((previous) => [...previous, audition.id]);

    try {
      await auditionsApi.updateStatus(audition.id, nextStatus);
      await fetchAuditions();
    } catch (requestError) {
      console.error("Failed to change audition status:", requestError);
      setActionError(
        requestError.message ||
          `Unable to ${nextStatus ? "activate" : "deactivate"} this audition.`
      );
    } finally {
      setChangingAuditionIds((previous) =>
        previous.filter((id) => id !== audition.id)
      );
    }
  };

  // Export auditions data to Excel format
  const handleExportExcel = () => {
    if (auditions.length === 0) {
      window.alert("There are no audition records to export.");
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = auditions.map((audition, index) => ({
        'S.No': index + 1,
        'ID': audition.id || '',
        'Full Name': audition.full_name || '',
        'Mobile Number': audition.mobile_number || '',
        'WhatsApp Number': audition.whatsapp_number || '',
        'Email': audition.email || '',
        'Age': audition.age ?? '',
        'Gender': audition.gender || '',
        'City': audition.city || '',
        'Address': audition.address || '',
        'Emergency Contact': audition.emergency_contact || '',
        'Emergency Contact Name': audition.emergency_contact_name || '',
        'Previous Experience': audition.previous_experience || '',
        'Talent Description': audition.talent_description || '',
        'Application Status': audition.application_status || '',
        'Status': status,
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 6 },  // S.No
        { wch: 8 },  // ID
        { wch: 20 }, // Full Name
        { wch: 15 }, // Mobile Number
        { wch: 15 }, // WhatsApp Number
        { wch: 25 }, // Email
        { wch: 6 },  // Age
        { wch: 10 }, // Gender
        { wch: 15 }, // City
        { wch: 30 }, // Address
        { wch: 15 }, // Emergency Contact
        { wch: 20 }, // Emergency Contact Name
        { wch: 20 }, // Previous Experience
        { wch: 30 }, // Talent Description
        { wch: 20 }, // Application Status
        { wch: 10 }, // Status
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditions');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Auditions_${status}_${timestamp}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      window.alert('Failed to export to Excel. Please try again.');
    }
  };

  // Export auditions data to PDF format
  const handleExportPdf = () => {
    if (auditions.length === 0) {
      window.alert("There are no audition records to export.");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // Add title
      const title = `${status} Auditions Report`;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(title, 14, 15);

      // Add generation date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const dateStr = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${dateStr}`, 14, 22);

      // Prepare table data
      const tableHeaders = [
        'S.No',
        'Name',
        'Mobile',
        'Age',
        'Gender',
        'City',
        'Email',
        'Experience'
      ];

      const tableData = auditions.map((audition, index) => [
        index + 1,
        audition.full_name || '—',
        audition.mobile_number || '—',
        audition.age ?? '—',
        audition.gender || '—',
        audition.city || '—',
        audition.email || '—',
        audition.previous_experience || '—'
      ]);

      // Add table to PDF
      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 28,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 28, left: 14, right: 14 },
      });

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Auditions_${status}_${timestamp}.pdf`;

      // Download the file
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      window.alert('Failed to export to PDF. Please try again.');
    }
  };

  return (
    <div
      className={`sharpner-auditions-page${
        status === "Inactive" ? " is-inactive" : ""
      }`}
    >
      <AuditionsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((previous) => !previous)}
      />

      {/* Main content */}
      <main className="auditions-main">
        {/* Header */}
        <header className="auditions-header">
          <h1>
            <span className="auditions-title-icon">
              {status === "Inactive" ? "⏸️" : "🎭"}
            </span>
            {status === "Inactive" ? "Inactive Auditions" : "Manage Auditions"}
          </h1>

          <div className="auditions-header-actions">
            <Link
              to="/admin/auditions"
              onClick={() => setCurrentPage(1)}
              className={`auditions-status-button ${
                status === "Active"
                  ? "auditions-status-selected"
                  : ""
              }`}
              aria-current={status === "Active" ? "page" : undefined}
            >
              ☑ Active
            </Link>

            {/* Only Super Admin can see Inactive tab */}
            {canEdit && (
              <Link
                to="/admin/auditions/inactive"
                onClick={() => setCurrentPage(1)}
                className={`auditions-inactive-button ${
                  status === "Inactive"
                    ? "auditions-inactive-selected"
                    : ""
                }`}
                aria-current={status === "Inactive" ? "page" : undefined}
              >
                ⏸ Inactive
              </Link>
            )}

            {/* Add New is available to both admin roles. */}
            {status === "Active" && (
              <Link
                to="/admin/auditions/create"
                className="auditions-add-new-button"
              >
                <span>＋</span> Add New
              </Link>
            )}

            {/* Export buttons available for both Admin and Super Admin */}
            {status === "Active" && (
              <>
                <button
                  type="button"
                  className="auditions-export-excel"
                  onClick={handleExportExcel}
                  disabled={loading || auditions.length === 0}
                >
                  📊 Export Excel
                </button>

                <button
                  type="button"
                  className="auditions-export-pdf"
                  onClick={handleExportPdf}
                  disabled={loading || auditions.length === 0}
                >
                  📄 Export PDF
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content card */}
        <section className="auditions-content-card">
          {/* Search form */}
          <form
            className="auditions-search-form"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, city or mobile..."
              aria-label="Search auditions by name, city or mobile"
            />

            <button
              type="submit"
              className="auditions-search-button"
              disabled={loading}
            >
              <span>⌕</span>
              Search
            </button>

            <button
              type="button"
              className="auditions-reset-button"
              onClick={handleReset}
            >
              <span>×</span>
              Reset
            </button>
          </form>

          {/* API error message */}
          {error && (
            <div role="alert" className="auditions-error">
              <p>Failed to load auditions: {error}</p>

              <button
                type="button"
                onClick={fetchAuditions}
                disabled={loading}
              >
                {loading ? "Loading..." : "Retry"}
              </button>
            </div>
          )}

          {actionError && (
            <div role="alert" className="auditions-error">
              <p>{actionError}</p>
            </div>
          )}

          {/* Auditions table */}
          <div className="auditions-table-wrapper">
            <table className="auditions-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile No</th>
                  <th>Age</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="auditions-empty-cell">
                      Loading audition applications...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="auditions-empty-cell">
                      Unable to load audition applications.
                    </td>
                  </tr>
                ) : auditions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="auditions-empty-cell">
                      No {status.toLowerCase()} audition applications found.
                    </td>
                  </tr>
                ) : (
                  auditions.map((audition) => (
                    <tr key={audition.id}>
                      <td>{audition.full_name || "—"}</td>

                      <td>{audition.mobile_number || "—"}</td>

                      <td>{audition.age ?? "—"}</td>

                      <td>{audition.city || "—"}</td>

                      <td>
                        <div className="auditions-row-actions">
                        <button
                          type="button"
                          className="auditions-view-button"
                          onClick={() => handleViewAudition(audition)}
                          aria-label={`View ${audition.full_name}`}
                        >
                          View
                        </button>
                        
                        {/* Only Super Admin can edit and deactivate */}
                        {canEdit && status === "Active" ? (
                          <>
                            <Link
                              to={`/admin/auditions/${encodeURIComponent(audition.id)}/edit`}
                              className="auditions-edit-button"
                              aria-label={`Edit ${audition.full_name}`}
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="auditions-deactivate-button"
                              onClick={() => handleStatusChange(audition)}
                              disabled={
                                loading ||
                                changingAuditionIds.includes(audition.id)
                              }
                            >
                              {changingAuditionIds.includes(audition.id)
                                ? "Deactivating..."
                                : "Deactivate"}
                            </button>
                          </>
                        ) : canEdit && status === "Inactive" ? (
                          <button
                            type="button"
                            className="auditions-activate-button"
                            onClick={() => handleStatusChange(audition)}
                            disabled={
                              loading ||
                              changingAuditionIds.includes(audition.id)
                            }
                          >
                            {changingAuditionIds.includes(audition.id)
                              ? "Activating..."
                              : "Activate"}
                          </button>
                        ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Result count */}
          <div className="auditions-result-count">
            {loading
              ? "Loading records..."
              : error
                ? "Records could not be loaded."
                : `Showing ${
                    auditions.length === 0
                      ? 0
                      : (pagination.current_page - 1) *
                          pagination.per_page +
                        1
                  }–${
                    (pagination.current_page - 1) *
                      pagination.per_page +
                    auditions.length
                  } of ${pagination.total} audition records`}
          </div>

          {/* Dynamic pagination */}
          {!loading &&
            !error &&
            pagination.last_page > 1 && (
              <div className="auditions-pagination">
                <button
                  type="button"
                  className={`auditions-page-button ${
                    currentPage <= 1
                      ? "auditions-page-disabled"
                      : ""
                  }`}
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {Array.from(
                  { length: pagination.last_page },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`auditions-page-button ${
                      currentPage === page
                        ? "auditions-page-current"
                        : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="auditions-page-button"
                  disabled={currentPage >= pagination.last_page}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(pagination.last_page, page + 1)
                    )
                  }
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}