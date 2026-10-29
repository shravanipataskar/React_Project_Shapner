import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import {
  getTalentVideoUrl,
  talentShowApi,
} from "../../services/talentShowApi.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/TalentShowCreate.css";

const initialForm = {
  childName: "",
  parentName: "",
  age: "",
  city: "",
  contactNumber: "",
  childUniqueness: "",
  talentDescription: "",
  socialMediaLink: "",
  confirmInformation: false,
  materialConsent: false,
  guardianPresence: false,
  digitalSignature: "",
  date: "",
};

function firstValue(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== null && record?.[key] !== undefined) {
      return record[key];
    }
  }
  return "";
}

function isChecked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function getDateValue(value) {
  if (!value) {
    return "";
  }
  const date = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return date ? date[0] : "";
}

function mapApplication(application) {
  return {
    childName: firstValue(application, "child_name", "childName", "name"),
    parentName: firstValue(application, "parent_name", "parentName"),
    age: firstValue(application, "age", "child_age"),
    city: firstValue(application, "city", "parent_city"),
    contactNumber: firstValue(
      application,
      "contact_number",
      "contact_no",
      "contactNo",
      "mobile_number",
      "phone"
    ),
    childUniqueness: firstValue(
      application,
      "what_makes_unique",
      "child_uniqueness",
      "childUniqueness"
    ),
    talentDescription: firstValue(
      application,
      "talent_description",
      "talentDescription"
    ),
    socialMediaLink: firstValue(
      application,
      "social_media",
      "social_media_link",
      "socialMediaLink"
    ),
    confirmInformation: isChecked(application.declaration_true),
    materialConsent: isChecked(application.declaration_review),
    guardianPresence: isChecked(application.declaration_parent_presence),
    digitalSignature: firstValue(
      application,
      "digital_signature",
      "digitalSignature"
    ),
    date: getDateValue(
      firstValue(application, "signature_date", "date", "created_at")
    ),
  };
}

function TalentShowEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestState, setRequestState] = useState({
    id: null,
    loading: true,
    error: "",
  });
  const [formData, setFormData] = useState(initialForm);
  const [talentVideo, setTalentVideo] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

        setFormData(mapApplication(application));
        setTalentVideo(firstValue(application, "talent_video", "talentVideo"));
        setRequestState({ id, loading: false, error: "" });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Failed to load Talent Show application:", error);
        setRequestState({
          id,
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

  const loading = requestState.id !== id || requestState.loading;
  const loadError = requestState.id === id ? requestState.error : "";

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaveError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const payload = {
      child_name: formData.childName.trim(),
      parent_name: formData.parentName.trim(),
      age: Number(formData.age),
      city: formData.city.trim(),
      contact_number: formData.contactNumber.trim(),
      what_makes_unique: formData.childUniqueness.trim() || null,
      talent_description: formData.talentDescription.trim() || null,
      social_media: formData.socialMediaLink.trim() || null,
      declaration_true: formData.confirmInformation,
      declaration_review: formData.materialConsent,
      declaration_parent_presence: formData.guardianPresence,
      digital_signature: formData.digitalSignature.trim(),
      signature_date: formData.date,
    };

    setSaving(true);
    setSaveError("");
    try {
      if (videoFile) {
        const formDataPayload = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          formDataPayload.append(
            key,
            value === null ? "" : String(value)
          );
        });
        formDataPayload.append("talent_video", videoFile);
        await talentShowApi.update(id, formDataPayload);
      } else {
        await talentShowApi.update(id, payload);
      }

      navigate(`/admin/talent-show/${encodeURIComponent(id)}`);
    } catch (error) {
      console.error("Failed to update Talent Show application:", error);
      setSaveError(
        error.status === 404
          ? "This Talent Show application could not be found."
          : error.status === 422
            ? error.message
            : "Unable to update this application. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout pageClass="talent-show-admin talent-show-create-admin talent-show-edit-admin">
      <main className="dashboard-main talent-show-main talent-show-create-main">
        <header className="talent-show-create-header">
          <h1>
            <span aria-hidden="true">🌟</span>
            Edit Talent Show Application
          </h1>
          <Link className="talent-show-create-back" to="/admin/talent-show">
            ← Back
          </Link>
        </header>

        {loading ? (
          <div className="talent-show-edit-message" role="status">
            Loading Talent Show application...
          </div>
        ) : loadError ? (
          <div className="talent-show-edit-message is-error" role="alert">
            <p>{loadError}</p>
            <Link to="/admin/talent-show">← Back to applications</Link>
          </div>
        ) : (
          <section
            className="talent-show-create-card talent-show-edit-card"
            aria-labelledby="talent-show-edit-title"
          >
            <h2 id="talent-show-edit-title">Form Details</h2>
            <form
              className="talent-show-create-form"
              onSubmit={handleSubmit}
            >
              <label className="talent-show-create-field">
                <span>Child Name *</span>
                <input name="childName" value={formData.childName} onChange={updateField} required maxLength={255} />
              </label>

              <label className="talent-show-create-field">
                <span>Parent Name *</span>
                <input name="parentName" value={formData.parentName} onChange={updateField} required maxLength={255} />
              </label>

              <label className="talent-show-create-field">
                <span>Age *</span>
                <input name="age" type="number" min="0" max="120" value={formData.age} onChange={updateField} required />
              </label>

              <label className="talent-show-create-field">
                <span>City *</span>
                <input name="city" value={formData.city} onChange={updateField} required maxLength={255} />
              </label>

              <label className="talent-show-create-field">
                <span>Contact Number *</span>
                <input name="contactNumber" type="tel" value={formData.contactNumber} onChange={updateField} required maxLength={255} />
              </label>

              <label className="talent-show-create-field is-full-width">
                <span>What makes your child unique?</span>
                <textarea name="childUniqueness" value={formData.childUniqueness} onChange={updateField} />
              </label>

              <label className="talent-show-create-field is-full-width">
                <span>Talent Description</span>
                <textarea name="talentDescription" value={formData.talentDescription} onChange={updateField} />
              </label>

              <label className="talent-show-create-field">
                <span>Upload Talent Video</span>
                {talentVideo && (
                  <video
                    className="talent-show-edit-video"
                    src={getTalentVideoUrl(talentVideo)}
                    controls
                    preload="metadata"
                  >
                    Your browser does not support video playback.
                  </video>
                )}
                <input
                  className="talent-show-create-file"
                  name="talentVideo"
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={(event) => {
                    setVideoFile(event.target.files?.[0] ?? null);
                    setSaveError("");
                  }}
                />
                <small>Max 500MB, MP4/MOV/AVI</small>
              </label>

              <label className="talent-show-create-field">
                <span>Social Media Link (Optional)</span>
                <input
                  name="socialMediaLink"
                  type="url"
                  placeholder="https://..."
                  value={formData.socialMediaLink}
                  onChange={updateField}
                />
              </label>

              <fieldset className="talent-show-create-declaration">
                <legend>Declaration</legend>
                <label>
                  <input name="confirmInformation" type="checkbox" checked={formData.confirmInformation} onChange={updateField} />
                  <span>I confirm that the information provided is true.</span>
                </label>
                <label>
                  <input name="materialConsent" type="checkbox" checked={formData.materialConsent} onChange={updateField} />
                  <span>
                    I allow SHARPNER to review and use submitted material for
                    selection purposes.
                  </span>
                </label>
                <label>
                  <input name="guardianPresence" type="checkbox" checked={formData.guardianPresence} onChange={updateField} />
                  <span>
                    Parent/guardian presence will be maintained wherever
                    required.
                  </span>
                </label>
              </fieldset>

              <label className="talent-show-create-field">
                <span>Digital Signature (Parent Full Name) *</span>
                <input name="digitalSignature" value={formData.digitalSignature} onChange={updateField} required maxLength={255} />
              </label>

              <label className="talent-show-create-field">
                <span>Date *</span>
                <input name="date" type="date" lang="en-GB" value={formData.date} onChange={updateField} required />
              </label>

              {saveError && (
                <p className="talent-show-edit-error" role="alert">
                  {saveError}
                </p>
              )}

              <div className="talent-show-create-actions">
                <Link
                  className="talent-show-button talent-show-button-inactive"
                  to="/admin/talent-show"
                >
                  Cancel
                </Link>
                <button
                  className="talent-show-button talent-show-button-add"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Application"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </AdminLayout>
  );
}

export default TalentShowEdit;
