import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DholPathakSidebar from "../../components/admin/DholPathakSidebar.jsx";
import { dholPathakApi } from "../../services/dholPathakApi";
import "../../styles/pages/DholPathakPage.css";

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
}

function isAccepted(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function displayDays(value) {
  if (!value) {
    return "N/A";
  }

  let parsed = value;
  for (let depth = 0; depth < 2 && typeof parsed === "string"; depth += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }

  return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
}

function formatCreatedAt(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function DetailField({ label, value }) {
  return (
    <div className="dhol-detail-field">
      <dt>{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function DholPathakDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestState, setRequestState] = useState({
    id: null,
    application: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplication() {
      try {
        const result = await dholPathakApi.getById(id, {
          signal: controller.signal,
        });
        const application = result?.data ?? result;

        if (
          !application ||
          Array.isArray(application) ||
          typeof application !== "object" ||
          (application.id !== undefined && String(application.id) !== String(id))
        ) {
          throw new Error("The application response did not match the requested ID.");
        }

        setRequestState({ id, application, loading: false, error: "" });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Failed to load Dhol Pathak application:", error);
        setRequestState({
          id,
          application: null,
          loading: false,
          error:
            error.status === 404
              ? "This Dhol Pathak application could not be found."
              : "Unable to load this application. Please try again.",
        });
      }
    }

    loadApplication();
    return () => controller.abort();
  }, [id]);

  const currentRequest = requestState.id === id;
  const loading = !currentRequest || requestState.loading;
  const error = currentRequest ? requestState.error : "";
  const application = currentRequest ? requestState.application : null;
  const isActive = Number(application?.status) === 1;

  return (
    <div className="sharpner-dhol-page dhol-record-page">
      <DholPathakSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((open) => !open)}
      />
      <main className="dhol-main">
        <header className="dhol-create-header">
          <h1>
            <span>🥁</span> Dhol Pathak Application Details
          </h1>
          <button
            type="button"
            className="dhol-back-button"
            onClick={() => navigate("/admin/dhol-pathak")}
          >
            ← Back
          </button>
        </header>

        {loading ? (
          <div className="dhol-record-message" role="status">
            Loading application details...
          </div>
        ) : error ? (
          <div className="dhol-record-message dhol-record-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => navigate("/admin/dhol-pathak")}>
              ← Back to applications
            </button>
          </div>
        ) : application ? (
          <>
            <section className="dhol-details-card">
              <h2>Basic Information</h2>
              <div className="dhol-details-grid">
                <dl>
                  <DetailField label="Full Name" value={displayValue(application.full_name)} />
                  <DetailField label="Mobile Number" value={displayValue(application.mobile_number)} />
                  <DetailField label="Address" value={displayValue(application.address)} />
                  <DetailField label="Previous Dhol Experience" value={displayValue(application.previous_dhol_experience)} />
                  <DetailField label={'Medical Conditions (or write "None")'} value={displayValue(application.medical_conditions)} />
                  <DetailField label="Emergency Contact" value={displayValue(application.emergency_contact)} />
                  <DetailField label="Available Practice Days" value={displayDays(application.available_practice_days)} />
                  <DetailField label="Weekly Availability" value={displayValue(application.weekly_availability)} />
                  <DetailField label="Pune Practice Declaration" value={isAccepted(application.declaration_pune) ? "Accepted" : "Not accepted"} />
                  <DetailField label="Practice Discipline Declaration" value={isAccepted(application.declaration_discipline) ? "Accepted" : "Not accepted"} />
                </dl>
                <dl>
                  <DetailField label="Parent Name" value={displayValue(application.parent_name)} />
                  <DetailField label="City" value={displayValue(application.city)} />
                  <DetailField label="School/College Name" value={displayValue(application.school_college_name)} />
                  <DetailField label="Can Bring Own Instrument" value={displayValue(application.can_bring_instrument)} />
                  <DetailField label="Preferred Location" value={displayValue(application.preferred_location)} />
                  <DetailField label="Age Group" value={displayValue(application.age_group)} />
                  <DetailField label="Physical Participation Declaration" value={isAccepted(application.declaration_physical) ? "Accepted" : "Not accepted"} />
                  <DetailField label="Information Accuracy Declaration" value={isAccepted(application.declaration_true) ? "Accepted" : "Not accepted"} />
                  <DetailField label="Digital Signature" value={displayValue(application.digital_signature)} />
                  <DetailField label="Signature Date" value={displayValue(application.signature_date)} />
                </dl>
              </div>
            </section>

            <section className="dhol-details-card dhol-status-card">
              <h2>Status</h2>
              <div className="dhol-details-grid">
                <dl>
                  <DetailField
                    label="Active Status"
                    value={
                      <span
                        className={`dhol-status-badge ${
                          isActive
                            ? "dhol-status-badge-active"
                            : "dhol-status-badge-inactive"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                </dl>
                <dl>
                  <DetailField label="Created At" value={formatCreatedAt(application.created_at)} />
                </dl>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
