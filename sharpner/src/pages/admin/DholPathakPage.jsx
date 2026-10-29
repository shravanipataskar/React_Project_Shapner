import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/pages/DholPathakPage.css";
import { dholPathakApi } from "../../services/dholPathakApi";
import DholPathakSidebar from "../../components/admin/DholPathakSidebar.jsx";

const practiceDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const declarations = [
  "I understand the practice sessions will be held in Pune.",
  "I confirm that I will attend the 55-day practice discipline sincerely.",
  "I understand physical participation is required.",
  "I confirm that the information provided is true.",
];

const initialFormDate = new Date().toLocaleDateString("en-CA");

const emptyForm = {
  ageGroup: "",
  fullName: "",
  parentName: "",
  mobileNumber: "",
  city: "",
  address: "",
  schoolName: "",
  previousExperience: "",
  ownInstrument: "",
  medicalConditions: "",
  emergencyContact: "",
  weeklyAvailability: "",
  practiceDays: [],
  preferredLocation: "",
  declarations: [],
  signature: "",
  date: initialFormDate,
};

export default function DholPathakPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const status = location.pathname.endsWith("/inactive") ? "Inactive" : "Active";
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({ ...emptyForm });

  // API data and request states
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [confirmingApplication, setConfirmingApplication] = useState(null);
  const [changingApplicationId, setChangingApplicationId] = useState(null);
  const [actionError, setActionError] = useState("");

  /*
   * Fetch applications from Laravel.
   * The database stores Active as 1 and Inactive as 0.
   */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await dholPathakApi.getAll({
        status: status === "Active" ? 1 : 0,
        search: appliedSearch,
        page: currentPage,
      });

      setApplications(Array.isArray(result.data) ? result.data : []);
      setCurrentPage(Number(result.current_page || 1));
      setLastPage(Number(result.last_page || 1));
      setTotal(Number(result.total || 0));
    } catch (requestError) {
      console.error("Failed to load Dhol Pathak applications:", requestError);

      setApplications([]);
      setTotal(0);
      setLastPage(1);
      setError(requestError.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [status, appliedSearch, currentPage]);

  useEffect(() => {
    if (!showCreateForm) {
      fetchApplications();
    }
  }, [fetchApplications, showCreateForm]);

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(search.trim());
  };

  const handleReset = () => {
    setSearch("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const performStatusChange = async (application, nextStatus) => {
    setChangingApplicationId(application.id);
    setActionError("");

    try {
      await dholPathakApi.update(application.id, { status: nextStatus });
      setConfirmingApplication(null);
      await fetchApplications();
    } catch (requestError) {
      console.error("Failed to change Dhol Pathak application status:", requestError);
      setActionError(
        requestError.message ||
          `Unable to ${nextStatus ? "activate" : "deactivate"} this application.`
      );
    } finally {
      setChangingApplicationId(null);
    }
  };

  const handleApplicationStatusChange = (application) => {
    if (status === "Active") {
      setConfirmingApplication(application);
      return;
    }

    performStatusChange(application, 1);
  };

  const confirmStatusChange = () => {
    if (confirmingApplication) {
      performStatusChange(confirmingApplication, 0);
    }
  };

  const updateFormField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleFormSelection = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }));
  };

  /*
   * Save a new application to the existing dhol_pathaks table.
   */
  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (formData.practiceDays.length < 4) {
      window.alert("Please select at least four available practice days.");
      return;
    }

    if (formData.declarations.length !== declarations.length) {
      window.alert("Please accept all declarations.");
      return;
    }

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        age_group: formData.ageGroup,
        full_name: formData.fullName.trim(),
        parent_name: formData.parentName.trim(),
        mobile_number: formData.mobileNumber.trim(),
        city: formData.city.trim(),
        address: formData.address.trim() || null,
        school_college_name: formData.schoolName.trim() || null,
        previous_dhol_experience: formData.previousExperience,
        can_bring_instrument: formData.ownInstrument,
        medical_conditions: formData.medicalConditions.trim(),
        preferred_location: formData.preferredLocation,
        emergency_contact: formData.emergencyContact.trim(),
        weekly_availability: formData.weeklyAvailability,

        // This database column stores the selected days as text.
        available_practice_days: JSON.stringify(formData.practiceDays),

        declaration_pune: formData.declarations.includes(declarations[0]),
        declaration_discipline: formData.declarations.includes(declarations[1]),
        declaration_physical: formData.declarations.includes(declarations[2]),
        declaration_true: formData.declarations.includes(declarations[3]),

        digital_signature: formData.signature.trim(),
        signature_date: formData.date,
        status: 1,
      };

      await dholPathakApi.create(payload);

      window.alert("Dhol Pathak application saved successfully.");

      setFormData({ ...emptyForm });
      setShowCreateForm(false);
      navigate("/admin/dhol-pathak");
      setSearch("");
      setAppliedSearch("");
      setCurrentPage(1);

      // The list refreshes when the create form closes.
    } catch (requestError) {
      console.error("Failed to save Dhol Pathak application:", requestError);

      window.alert(
        `Could not save the application.\n${requestError.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCreate = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Unsaved form data will be lost."
      )
    ) {
      setFormData({ ...emptyForm });
      setShowCreateForm(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  /*
   * The database contains an age_group column directly.
   * Use the stored value rather than calculating age from DOB.
   */
  const getAgeGroup = (application) => {
    return application.age_group || "—";
  };

  return (
    <div className="sharpner-dhol-page">
      <DholPathakSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((open) => !open)}
      />

      {/* Main content */}
      <main className="dhol-main">
        {showCreateForm ? (
          <>
            <header className="dhol-create-header">
              <h1>
                <span>🥁</span> Add New Dhol Pathak Application
              </h1>

              <button
                type="button"
                className="dhol-back-button"
                onClick={handleCancelCreate}
                disabled={saving}
              >
                ← Back
              </button>
            </header>

            <form
              className="dhol-create-card"
              onSubmit={handleCreateSubmit}
            >
              <section className="dhol-create-section dhol-age-section">
                <h2>Age Group</h2>

                <div className="dhol-create-radio-row">
                  {["8-10", "11-14", "15-18", "18+"].map((age) => (
                    <label key={age}>
                      <input
                        type="radio"
                        name="ageGroup"
                        value={age}
                        checked={formData.ageGroup === age}
                        onChange={updateFormField}
                        required
                      />
                      {age}
                    </label>
                  ))}
                </div>
              </section>

              <section className="dhol-create-section dhol-form-details-section">
                <h2>Form Details</h2>

                <div className="dhol-create-grid">
                  <label className="dhol-create-field">
                    <span>Full Name <b>*</b></span>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={updateFormField}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>Parent Name <b>*</b></span>
                    <input
                      name="parentName"
                      value={formData.parentName}
                      onChange={updateFormField}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>Mobile Number <b>*</b></span>
                    <input
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={updateFormField}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>City <b>*</b></span>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={updateFormField}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>Address</span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={updateFormField}
                      rows="4"
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>School / College Name</span>
                    <input
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={updateFormField}
                      maxLength={255}
                    />
                  </label>

                  <fieldset className="dhol-create-choice">
                    <legend>
                      Previous Dhol Experience? <span>*</span>
                    </legend>

                    <div className="dhol-create-radio-row">
                      {["Yes", "No"].map((choice) => (
                        <label key={choice}>
                          <input
                            type="radio"
                            name="previousExperience"
                            value={choice}
                            checked={formData.previousExperience === choice}
                            onChange={updateFormField}
                            required
                          />
                          {choice}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="dhol-create-choice">
                    <legend>
                      Can you bring your own instrument for Dhol Pathak?
                      <span>*</span>
                    </legend>

                    <div className="dhol-create-radio-row">
                      {["Yes", "No"].map((choice) => (
                        <label key={choice}>
                          <input
                            type="radio"
                            name="ownInstrument"
                            value={choice}
                            checked={formData.ownInstrument === choice}
                            onChange={updateFormField}
                            required
                          />
                          {choice}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              <section className="dhol-create-section">
                <h2>Medical &amp; Safety</h2>

                <div className="dhol-create-grid dhol-medical-grid">
                  <label className="dhol-create-field">
                    <span>
                      Medical Conditions (or write “None”) <b>*</b>
                    </span>

                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={updateFormField}
                      rows="4"
                      required
                    />
                  </label>

                  <div className="dhol-create-stack">
                    <label className="dhol-create-field">
                      <span>Emergency Contact <b>*</b></span>
                      <input
                        name="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={updateFormField}
                        maxLength={255}
                        required
                      />
                    </label>

                    <label className="dhol-create-field">
                      <span>Weekly Availability <b>*</b></span>

                      <select
                        name="weeklyAvailability"
                        value={formData.weeklyAvailability}
                        onChange={updateFormField}
                        required
                      >
                        <option value="">Select Option</option>
                        <option>1-2 days per week</option>
                        <option>3-4 days per week</option>
                        <option>5-6 days per week</option>
                        <option>All days</option>
                      </select>
                    </label>
                  </div>

                  <fieldset className="dhol-create-choice">
                    <legend>
                      Available Practice Days (Min 4) <span>*</span>
                    </legend>

                    <div className="dhol-create-days">
                      {practiceDays.map((day) => (
                        <label key={day}>
                          <input
                            type="checkbox"
                            checked={formData.practiceDays.includes(day)}
                            onChange={() =>
                              toggleFormSelection("practiceDays", day)
                            }
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="dhol-create-choice">
                    <legend>
                      Preferred Location <span>*</span>
                    </legend>

                    <div className="dhol-create-radio-row dhol-create-location">
                      {[
                        "Narayan Peth, Pune",
                        "Navale Bridge, Pune",
                      ].map((location) => (
                        <label key={location}>
                          <input
                            type="radio"
                            name="preferredLocation"
                            value={location}
                            checked={formData.preferredLocation === location}
                            onChange={updateFormField}
                            required
                          />
                          {location}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </section>

              <section className="dhol-create-section dhol-declaration-section">
                <h2>Declaration</h2>

                <div className="dhol-create-declarations">
                  {declarations.map((declaration) => (
                    <label key={declaration}>
                      <input
                        type="checkbox"
                        checked={formData.declarations.includes(declaration)}
                        onChange={() =>
                          toggleFormSelection("declarations", declaration)
                        }
                        required={
                          !formData.declarations.includes(declaration)
                        }
                      />
                      {declaration}
                    </label>
                  ))}
                </div>

                <div className="dhol-create-grid dhol-signature-fields">
                  <label className="dhol-create-field">
                    <span>
                      Digital Signature (Parent Full Name) <b>*</b>
                    </span>

                    <input
                      name="signature"
                      value={formData.signature}
                      onChange={updateFormField}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label className="dhol-create-field">
                    <span>Date <b>*</b></span>

                    <input
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={updateFormField}
                      required
                    />
                  </label>
                </div>
              </section>

              <div className="dhol-create-actions">
                <button
                  type="button"
                  className="dhol-create-cancel"
                  onClick={handleCancelCreate}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dhol-create-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Application"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <header className="dhol-header">
              <h1>
                <span className="dhol-title-icon">🥁</span>
                {status === "Inactive"
                  ? "Inactive Dhol Pathak Applications"
                  : "Manage Dhol Pathak Applications"}
              </h1>

              <div className="dhol-header-actions">
                <Link
                  to="/admin/dhol-pathak"
                  className={`dhol-status-button ${
                    status === "Active" ? "dhol-status-selected" : ""
                  }`}
                  aria-current={status === "Active" ? "page" : undefined}
                >
                  ☑ Active
                </Link>

                <Link
                  to="/admin/dhol-pathak/inactive"
                  className={`dhol-inactive-button ${
                    status === "Inactive" ? "dhol-inactive-selected" : ""
                  }`}
                  aria-current={status === "Inactive" ? "page" : undefined}
                >
                  ⏸ Inactive
                </Link>

                {status === "Active" && (
                  <>
                    <button
                      type="button"
                      className="dhol-add-button"
                      onClick={() => {
                        setFormData({ ...emptyForm });
                        setShowCreateForm(true);
                      }}
                    >
                      <span>＋</span> Add New
                    </button>

                    <button
                      type="button"
                      className="dhol-export-excel"
                      onClick={() =>
                        window.alert("Excel export is not connected yet.")
                      }
                    >
                      📊 Export Excel
                    </button>

                    <button
                      type="button"
                      className="dhol-export-pdf"
                      onClick={() =>
                        window.alert("PDF export is not connected yet.")
                      }
                    >
                      📄 Export PDF
                    </button>
                  </>
                )}
              </div>
            </header>

            <section className="dhol-content-card">
              {/* Search */}
              <form
                className="dhol-search-form"
                onSubmit={handleSearch}
              >
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, city or mobile..."
                  aria-label="Search Dhol Pathak applications"
                />

                <button type="submit" className="dhol-search-button">
                  <span className="dhol-search-icon">⌕</span>
                  Search
                </button>

                <button
                  type="button"
                  className="dhol-reset-button"
                  onClick={handleReset}
                >
                  <span>×</span>
                  Reset
                </button>
              </form>

              {/* Loading and error messages */}
              {loading && (
                <p role="status" aria-live="polite">
                  Loading Dhol Pathak applications...
                </p>
              )}

              {error && (
                <div role="alert" className="dhol-error-message">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={fetchApplications}
                    disabled={loading}
                  >
                    Retry
                  </button>
                </div>
              )}

              {actionError && !confirmingApplication && (
                <div role="alert" className="dhol-error-message">
                  <p>{actionError}</p>
                </div>
              )}

              {/* Applications table */}
              <div className="dhol-table-wrapper">
                <table className="dhol-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile No</th>
                      <th>Parent Name</th>
                      <th>City</th>
                      <th>Age Group</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && !error && applications.length === 0 && (
                      <tr>
                        <td colSpan="6" className="dhol-empty-cell">
                          No {status.toLowerCase()} applications found.
                        </td>
                      </tr>
                    )}

                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td>{application.full_name || "—"}</td>
                        <td>{application.mobile_number || "—"}</td>
                        <td>{application.parent_name || "—"}</td>
                        <td>{application.city || "—"}</td>
                        <td>
                          <span className="dhol-age-badge">
                            {getAgeGroup(application)}
                          </span>
                        </td>

                        <td>
                          <div className="dhol-row-actions">
                            <Link
                              className="dhol-view-button"
                              to={`/admin/dhol-pathak/${encodeURIComponent(application.id)}`}
                              aria-label={`View ${application.full_name}`}
                            >
                              View
                            </Link>
                            {status === "Active" ? (
                              <>
                                <Link
                                  className="dhol-edit-button"
                                  to={`/admin/dhol-pathak/${encodeURIComponent(application.id)}/edit`}
                                  aria-label={`Edit ${application.full_name}`}
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  className="dhol-deactivate-button"
                                  disabled={
                                    loading ||
                                    changingApplicationId === application.id
                                  }
                                  onClick={() =>
                                    handleApplicationStatusChange(application)
                                  }
                                >
                                  {changingApplicationId === application.id
                                    ? "Deactivating..."
                                    : "Deactivate"}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="dhol-activate-button"
                                disabled={
                                  loading ||
                                  changingApplicationId === application.id
                                }
                                onClick={() =>
                                  handleApplicationStatusChange(application)
                                }
                              >
                                {changingApplicationId === application.id
                                  ? "Activating..."
                                  : "Activate"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Results count */}
              <div className="dhol-results-count">
                Showing {applications.length} of {total} {status.toLowerCase()}{" "}
                applications
              </div>

              {/* Dynamic pagination */}
              {lastPage > 1 && (
                <nav
                  className="dhol-pagination"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    className={`dhol-page-button ${
                      currentPage === 1 ? "dhol-page-disabled" : ""
                    }`}
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: lastPage },
                    (_, index) => index + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === lastPage ||
                        Math.abs(page - currentPage) <= 2
                    )
                    .reduce((result, page, index, pages) => {
                      if (
                        index > 0 &&
                        page - pages[index - 1] > 1
                      ) {
                        result.push(
                          <span
                            key={`ellipsis-${page}`}
                            className="dhol-page-ellipsis"
                          >
                            ...
                          </span>
                        );
                      }

                      result.push(
                        <button
                          type="button"
                          key={page}
                          className={`dhol-page-button ${
                            currentPage === page
                              ? "dhol-page-current"
                              : ""
                          }`}
                          disabled={loading}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );

                      return result;
                    }, [])}

                  <button
                    type="button"
                    className={`dhol-page-button ${
                      currentPage === lastPage ? "dhol-page-disabled" : ""
                    }`}
                    disabled={currentPage === lastPage || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </nav>
              )}
            </section>
          </>
        )}
      </main>
      {confirmingApplication && (
        <section
          className="dhol-confirm-banner"
          role="alertdialog"
          aria-modal="false"
          aria-labelledby="dhol-confirm-title"
          aria-describedby="dhol-confirm-message"
        >
          <div className="dhol-confirm-copy">
            <h2 id="dhol-confirm-title">Deactivate application?</h2>
            <p id="dhol-confirm-message">
              Are you sure you want to deactivate{" "}
              {confirmingApplication.full_name || "this application"}?
            </p>
            {actionError && (
              <p className="dhol-confirm-error" role="alert">
                {actionError}
              </p>
            )}
          </div>
          <div className="dhol-confirm-actions">
            <button
              type="button"
              className="dhol-confirm-ok"
              onClick={confirmStatusChange}
              disabled={changingApplicationId !== null}
            >
              {changingApplicationId !== null ? "Working..." : "OK"}
            </button>
            <button
              type="button"
              className="dhol-confirm-cancel"
              onClick={() => {
                setConfirmingApplication(null);
                setActionError("");
              }}
              disabled={changingApplicationId !== null}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}