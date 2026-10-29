import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuditionsSidebar from "../../components/admin/AuditionsSidebar.jsx";
import { auditionsApi } from "../../services/auditionsApi";
import "../../styles/pages/AuditionsPage.css";

function getValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "N/A";
  }

  return String(value);
}

function getYesNoValue(value) {
  const normalizedValue = String(value).toLowerCase();
  if ([true, 1, "1"].includes(value) || normalizedValue === "yes") {
    return "Yes";
  }
  if ([false, 0, "0"].includes(value) || normalizedValue === "no") {
    return "No";
  }
  return getValue(value);
}

function getItems(value, extraValue) {
  let items = [];

  if (Array.isArray(value)) {
    items = value;
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      items = Array.isArray(parsed) ? parsed : value.split(",");
    } catch {
      items = value.split(",");
    }
  }

  const extra = typeof extraValue === "string" ? extraValue.trim() : "";
  return [...items, ...(extra ? [extra] : [])]
    .map((item) => String(item).trim())
    .filter((item, index, list) => item && list.indexOf(item) === index);
}

function getSafeUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const url = value.trim();
  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return url;
    }
  } catch {
    return "";
  }

  return "";
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return getValue(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DetailField({ label, value, badge, children }) {
  return (
    <div className="audition-detail-field">
      <dt>{label}:</dt>
      <dd>
        {children ??
          (badge && value !== "N/A" ? (
            <span className={`audition-detail-badge ${badge}`}>{value}</span>
          ) : (
            value
          ))}
      </dd>
    </div>
  );
}

function DetailSection({ title, left, right, className = "" }) {
  return (
    <section className={`audition-details-card ${className}`}>
      <h2>{title}</h2>
      <div className="audition-details-columns">
        <dl>{left}</dl>
        <dl>{right}</dl>
      </div>
    </section>
  );
}

function MediaItem({ label, value, video = false, photo = false }) {
  const url = getSafeUrl(value);
  const [failedUrl, setFailedUrl] = useState("");
  const imageFailed = failedUrl === url;

  return (
    <div className="audition-media-item">
      <h3>{label}:</h3>
      {photo && url && !imageFailed && (
        <img
          className="audition-media-preview"
          src={url}
          alt={label}
          onError={() => setFailedUrl(url)}
        />
      )}
      {video && url && (
        <p className="audition-video-note">
          {url.includes("google.com")
            ? "Video is hosted on Google Drive. Click the button below to view."
            : "Video is hosted externally. Click the button below to view."}
        </p>
      )}
      {url ? (
        <a
          className="audition-media-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {video ? "↗ Open Video Link" : "↗ Open Link"}
        </a>
      ) : (
        <p className="audition-media-empty">N/A</p>
      )}
    </div>
  );
}

function getConsentValue(record, declarationIndex, field) {
  if (record[field] !== undefined && record[field] !== null) {
    const value = getYesNoValue(record[field]);
    return value === "Yes" ? "Given" : value === "No" ? "Not Given" : value;
  }

  const declarations = getItems(record.declarations);
  return declarations.includes(String(declarationIndex)) ? "Given" : "N/A";
}

export default function AuditionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestState, setRequestState] = useState({
    id: null,
    audition: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAudition() {
      try {
        const result = await auditionsApi.getById(id, {
          signal: controller.signal,
        });
        const record = result?.data?.data ?? result?.data ?? result?.audition ?? result;

        if (!record || Array.isArray(record) || typeof record !== "object") {
          throw new Error("The audition response did not contain a record.");
        }
        if (record.id !== undefined && String(record.id) !== String(id)) {
          throw new Error("The audition response did not match the requested ID.");
        }

        setRequestState({
          id,
          audition: record,
          loading: false,
          error: "",
        });
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        console.error("Failed to load audition details:", requestError);
        setRequestState({
          id,
          audition: null,
          loading: false,
          error:
            requestError.status === 404
              ? "This audition could not be found."
              : "Unable to load audition details. Please try again.",
        });
      }
    }

    fetchAudition();
    return () => controller.abort();
  }, [id]);

  const hasCurrentRequest = requestState.id === id;
  const loading = !hasCurrentRequest || requestState.loading;
  const error = hasCurrentRequest ? requestState.error : "";
  const audition = hasCurrentRequest ? requestState.audition : null;
  const goBack = () => navigate("/admin/auditions");

  const languages = getItems(audition?.languages, audition?.other_language);
  const talents = getItems(audition?.talents, audition?.other_talent);
  const socialMediaUrl = getSafeUrl(audition?.social_media_links);
  const rawStatus = audition?.active_status ?? audition?.is_active ?? audition?.status;
  const isActive = ["1", "true", "active", "yes"].includes(
    String(rawStatus).toLowerCase()
  );
  const statusValue =
    rawStatus === null || rawStatus === undefined
      ? "N/A"
      : isActive
        ? "Active"
        : "Inactive";

  return (
    <div className="sharpner-auditions-page audition-details-page">
      <AuditionsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((previous) => !previous)}
      />

      <main className="auditions-main">
        <header className="audition-details-header">
          <h1>
            <span className="auditions-title-icon">🎭</span>
            Audition Details
          </h1>
          <button
            className="audition-details-back"
            type="button"
            onClick={goBack}
          >
            ← Back
          </button>
        </header>

        {loading ? (
          <div className="audition-details-message" role="status">
            Loading audition details...
          </div>
        ) : error ? (
          <div className="audition-details-message audition-details-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={goBack}>
              ← Back to auditions
            </button>
          </div>
        ) : audition ? (
          <div className="audition-details-sections">
            <DetailSection
              title="Child Information"
              left={
                <>
                  <DetailField label="Full Name" value={getValue(audition.full_name)} />
                  <DetailField label="Date of Birth" value={formatDate(audition.date_of_birth)} />
                  <DetailField label="Gender" value={getValue(audition.gender)} />
                  <DetailField label="State" value={getValue(audition.state)} />
                  <DetailField label="School Name" value={getValue(audition.school_name)} />
                  <DetailField label="Audition Type" value={getValue(audition.audition_type)} />
                </>
              }
              right={
                <>
                  <DetailField label="Nickname" value={getValue(audition.nickname)} />
                  <DetailField
                    label="Age"
                    value={getValue(audition.age)}
                    badge="audition-detail-badge-dark"
                  />
                  <DetailField label="City" value={getValue(audition.city)} />
                  <DetailField label="Height" value={getValue(audition.height)} />
                  <DetailField label="Hobbies" value={getValue(audition.hobbies)} />
                </>
              }
            />

            <DetailSection
              title="Languages & Communication"
              left={
                <>
                  <DetailField label="Primary Language" value={getValue(audition.primary_language)} />
                  <DetailField label="Can Read Script" value={getValue(audition.can_read_script)} />
                </>
              }
              right={
                <>
                  <DetailField label="Speaking Confidence" value={getValue(audition.speaking_confidence)} />
                  <DetailField
                    label="Languages Known"
                  >
                    {languages.length ? (
                      <div className="audition-detail-chips">
                        {languages.map((language) => (
                          <span className="audition-detail-chip" key={language}>
                            {language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </DetailField>
                </>
              }
            />

            <DetailSection
              title="Talents & Experience"
              left={
                <>
                  <DetailField
                    label="Talents"
                  >
                    {talents.length ? (
                      <div className="audition-detail-chips audition-detail-chips-green">
                        {talents.map((talent) => (
                          <span className="audition-detail-chip" key={talent}>
                            {talent}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </DetailField>
                  <DetailField label="Experience Details" value={getValue(audition.experience_details)} />
                  <DetailField
                    label="Social Media Links"
                  >
                    {socialMediaUrl ? (
                      <a
                        className="audition-detail-external-link"
                        href={socialMediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {audition.social_media_links}
                      </a>
                    ) : (
                      getValue(audition.social_media_links)
                    )}
                  </DetailField>
                </>
              }
              right={
                <DetailField
                  label="Previous Experience"
                  value={getYesNoValue(audition.previous_experience)}
                />
              }
            />

            <DetailSection
              title="Medical Details"
              left={
                <>
                  <DetailField label="Has Medical Condition" value={getYesNoValue(audition.has_medical_condition)} />
                  <DetailField label="On Regular Medication" value={getYesNoValue(audition.on_regular_medication)} />
                </>
              }
              right={
                <>
                  <DetailField label="Has Allergies" value={getYesNoValue(audition.has_allergies)} />
                  <DetailField label="Blood Group" value={getValue(audition.blood_group)} />
                </>
              }
            />

            <DetailSection
              title="Availability"
              left={
                <>
                  <DetailField label="Weekly Availability" value={getValue(audition.weekly_availability)} />
                  <DetailField label="Comfortable with Outdoor Shoot" value={getYesNoValue(audition.outdoor_shoot_comfort)} />
                </>
              }
              right={
                <>
                  <DetailField label="Preferred Time Slot" value={getValue(audition.preferred_time_slot)} />
                  <DetailField label="Outstation Travel" value={getValue(audition.outstation_travel)} />
                </>
              }
            />

            <DetailSection
              title="Parent Information"
              left={
                <>
                  <DetailField label="Parent Name" value={getValue(audition.parent_name)} />
                  <DetailField label="Mobile Number" value={getValue(audition.mobile_number)} />
                  <DetailField label="Email" value={getValue(audition.email)} />
                  <DetailField label="Emergency Contact" value={getValue(audition.emergency_contact)} />
                </>
              }
              right={
                <>
                  <DetailField label="Relationship" value={getValue(audition.relationship)} />
                  <DetailField label="WhatsApp Number" value={getValue(audition.whatsapp_number)} />
                  <DetailField label="Parent City" value={getValue(audition.parent_city)} />
                </>
              }
            />

            <section className="audition-details-card audition-details-media">
              <h2>Media</h2>
              <div className="audition-media-grid">
                <MediaItem label="Closeup Photo" value={audition.closeup_photo} photo />
                <MediaItem label="Full Length Photo" value={audition.full_length_photo} photo />
                <MediaItem label="Audition Video" value={audition.audition_video} video />
                <MediaItem label="Previous Work" value={audition.previous_work} video />
              </div>
            </section>

            <DetailSection
              title="Consent & Agreement"
              left={
                <>
                  <DetailField
                    label="Information Consent"
                    value={getConsentValue(audition, 0, "information_consent")}
                  />
                  <DetailField
                    label="Promotion Consent"
                    value={getConsentValue(audition, 2, "promotion_consent")}
                  />
                  <DetailField
                    label="Selection Process Consent"
                    value={getConsentValue(audition, 4, "selection_process_consent")}
                  />
                  <DetailField label="Digital Signature" value={getValue(audition.guardian_signature)} />
                </>
              }
              right={
                <>
                  <DetailField
                    label="Media Use Consent"
                    value={getConsentValue(audition, 1, "media_use_consent")}
                  />
                  <DetailField
                    label="Safety Rules Consent"
                    value={getConsentValue(audition, 3, "safety_rules_consent")}
                  />
                  <DetailField
                    label="Education Priority Consent"
                    value={getConsentValue(audition, 5, "education_priority_consent")}
                  />
                  <DetailField label="Signature Date" value={formatDate(audition.declaration_date)} />
                </>
              }
            />

            <DetailSection
              title="Status"
              left={
                <>
                  <DetailField
                    label="Application Status"
                    value={getValue(audition.application_status)}
                  />
                  <DetailField label="Created At" value={formatDate(audition.created_at)} />
                </>
              }
              right={
                <DetailField
                  label="Active Status"
                  value={statusValue}
                  badge={
                    statusValue === "N/A"
                      ? undefined
                      : isActive
                        ? "audition-detail-badge-green"
                        : "audition-detail-badge-inactive"
                  }
                />
              }
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
