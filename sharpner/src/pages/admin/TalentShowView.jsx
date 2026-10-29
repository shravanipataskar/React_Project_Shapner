import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import {
  getTalentVideoUrl,
  talentShowApi,
} from "../../services/talentShowApi.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/TalentShowCreate.css";

const detailFields = [
  ["child_name", "Child Name"],
  ["parent_name", "Parent Name"],
  ["age", "Age"],
  ["city", "City"],
  ["contact_number", "Contact Number"],
  ["what_makes_unique", "What makes your child unique?"],
  ["talent_description", "Talent Description"],
  ["social_media", "Social Media Link"],
  ["digital_signature", "Digital Signature"],
  ["signature_date", "Date"],
];

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function isChecked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function TalentShowView() {
  const { id } = useParams();
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
        const result = await talentShowApi.getById(id, {
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
        console.error("Failed to load Talent Show application:", error);
        setRequestState({
          id,
          application: null,
          loading: false,
          error:
            error.status === 404
              ? "This Talent Show application could not be found."
              : "Unable to load this application. Please try again.",
        });
      }
    }

    loadApplication();
    return () => controller.abort();
  }, [id]);

  const currentRequest = requestState.id === id;
  const loading = !currentRequest || requestState.loading;
  const application = currentRequest ? requestState.application : null;
  const error = currentRequest ? requestState.error : "";

  return (
    <AdminLayout pageClass="talent-show-admin talent-show-create-admin talent-show-detail-admin">
      <main className="dashboard-main talent-show-main talent-show-create-main">
        <header className="talent-show-create-header">
          <h1>
            <span aria-hidden="true">🌟</span>
            Talent Show Application
          </h1>
          <Link className="talent-show-create-back" to="/admin/talent-show">
            ← Back
          </Link>
        </header>

        {loading ? (
          <div className="talent-show-edit-message" role="status">
            Loading Talent Show application...
          </div>
        ) : error ? (
          <div className="talent-show-edit-message is-error" role="alert">
            <p>{error}</p>
            <Link to="/admin/talent-show">← Back to applications</Link>
          </div>
        ) : application ? (
          <section className="talent-show-create-card talent-show-detail-card">
            <h2>Application Details</h2>
            <dl className="talent-show-detail-grid">
              {detailFields.map(([field, label]) => (
                <div key={field}>
                  <dt>{label}</dt>
                  <dd>{displayValue(application[field])}</dd>
                </div>
              ))}
              <div>
                <dt>Information Declaration</dt>
                <dd>{isChecked(application.declaration_true) ? "Accepted" : "Not accepted"}</dd>
              </div>
              <div>
                <dt>Material Review Consent</dt>
                <dd>{isChecked(application.declaration_review) ? "Accepted" : "Not accepted"}</dd>
              </div>
              <div>
                <dt>Parent/Guardian Presence</dt>
                <dd>{isChecked(application.declaration_parent_presence) ? "Accepted" : "Not accepted"}</dd>
              </div>
              <div>
                <dt>Application Status</dt>
                <dd>{Number(application.status) === 1 ? "Active" : "Inactive"}</dd>
              </div>
            </dl>
            {application.talent_video && (
              <div className="talent-show-detail-video">
                <h3>Talent Video</h3>
                <video
                  src={getTalentVideoUrl(application.talent_video)}
                  controls
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            )}
            <div className="talent-show-create-actions">
              <Link
                className="talent-show-button talent-show-button-add"
                to={`/admin/talent-show/${encodeURIComponent(id)}/edit`}
              >
                Edit Application
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </AdminLayout>
  );
}

export default TalentShowView;
