import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DholPathakSidebar from "../../components/admin/DholPathakSidebar.jsx";
import { dholPathakApi } from "../../services/dholPathakApi";
import { useAuth } from "../../app/authContext.js";
import "../../styles/pages/DholPathakPage.css";

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
  {
    field: "declaration_pune",
    label: "I understand the practice sessions will be held in Pune.",
  },
  {
    field: "declaration_discipline",
    label: "I confirm that I will attend the 55-day practice discipline sincerely.",
  },
  {
    field: "declaration_physical",
    label: "I understand physical participation is required.",
  },
  {
    field: "declaration_true",
    label: "I confirm that the information provided is true.",
  },
];

function getPracticeDays(value) {
  let parsed = value;
  for (let depth = 0; depth < 2 && typeof parsed === "string"; depth += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter((day) => typeof day === "string");
  }

  return typeof parsed === "string"
    ? parsed.split(",").map((day) => day.trim()).filter(Boolean)
    : [];
}

function getDateInput(value) {
  if (!value) {
    return "";
  }
  const dateString = String(value);
  const isoDate = dateString.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoDate) {
    return isoDate[0];
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function isAccepted(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function mapApplication(application) {
  return {
    ageGroup: application.age_group || "",
    fullName: application.full_name || "",
    parentName: application.parent_name || "",
    mobileNumber: application.mobile_number || "",
    city: application.city || "",
    address: application.address || "",
    schoolName: application.school_college_name || "",
    previousExperience: application.previous_dhol_experience || "",
    ownInstrument: application.can_bring_instrument || "",
    medicalConditions: application.medical_conditions || "",
    emergencyContact: application.emergency_contact || "",
    weeklyAvailability: application.weekly_availability || "",
    practiceDays: getPracticeDays(application.available_practice_days),
    preferredLocation: application.preferred_location || "",
    declarations: declarations
      .filter(({ field }) => isAccepted(application[field]))
      .map(({ label }) => label),
    signature: application.digital_signature || "",
    date: getDateInput(application.signature_date),
  };
}

function FormField({ label, children }) {
  return (
    <label className="dhol-create-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ChoiceField({ label, required, children }) {
  return (
    <fieldset className="dhol-create-choice">
      <legend>
        {label} {required && <span>*</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export default function EditDholPathakPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestState, setRequestState] = useState({
    id: null,
    loading: true,
    error: "",
  });
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Redirect admin users (user_type "11" or 11) - only super admin can edit
  useEffect(() => {
    if (user?.user_type === "11" || user?.user_type === 11) {
      navigate("/admin/dhol-pathak", { replace: true });
    }
  }, [user, navigate]);

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

        setRequestState({ id, loading: false, error: "" });
        setFormData(mapApplication(application));
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Failed to load Dhol Pathak application for editing:", error);
        setRequestState({
          id,
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
  const loadError = currentRequest ? requestState.error : "";

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSaveError("");
  };

  const toggleSelection = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }));
    setSaveError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.practiceDays.length < 4) {
      setSaveError("Please select at least four available practice days.");
      return;
    }
    if (formData.declarations.length !== declarations.length) {
      setSaveError("Please accept all declarations.");
      return;
    }
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    setSaving(true);
    setSaveError("");
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
        emergency_contact: formData.emergencyContact.trim(),
        weekly_availability: formData.weeklyAvailability,
        available_practice_days: JSON.stringify(formData.practiceDays),
        preferred_location: formData.preferredLocation,
        declaration_pune: formData.declarations.includes(declarations[0].label),
        declaration_discipline: formData.declarations.includes(declarations[1].label),
        declaration_physical: formData.declarations.includes(declarations[2].label),
        declaration_true: formData.declarations.includes(declarations[3].label),
        digital_signature: formData.signature.trim(),
        signature_date: formData.date,
      };

      await dholPathakApi.update(id, payload);
      navigate(`/admin/dhol-pathak/${encodeURIComponent(id)}`);
    } catch (error) {
      console.error("Failed to update Dhol Pathak application:", error);
      setSaveError(
        error.status === 404
          ? "This Dhol Pathak application could not be found."
          : "Unable to update this application. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const backToList = () => navigate("/admin/dhol-pathak");

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
            <span>🥁</span> Edit Dhol Pathak Application
          </h1>
          <button type="button" className="dhol-back-button" onClick={backToList}>
            ← Back
          </button>
        </header>

        {loading ? (
          <div className="dhol-record-message" role="status">
            Loading application details...
          </div>
        ) : loadError ? (
          <div className="dhol-record-message dhol-record-error" role="alert">
            <p>{loadError}</p>
            <button type="button" onClick={backToList}>
              ← Back to applications
            </button>
          </div>
        ) : formData ? (
          <form className="dhol-create-card" onSubmit={handleSubmit}>
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
                      onChange={updateField}
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
                <FormField label={<>Full Name <b>*</b></>}>
                  <input name="fullName" value={formData.fullName} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label={<>Parent Name <b>*</b></>}>
                  <input name="parentName" value={formData.parentName} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label={<>Mobile Number <b>*</b></>}>
                  <input name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label={<>City <b>*</b></>}>
                  <input name="city" value={formData.city} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label="Address">
                  <textarea name="address" value={formData.address} onChange={updateField} rows="4" />
                </FormField>
                <FormField label="School / College Name">
                  <input name="schoolName" value={formData.schoolName} onChange={updateField} maxLength={255} />
                </FormField>
                <ChoiceField label="Previous Dhol Experience?" required>
                  <div className="dhol-create-radio-row">
                    {["Yes", "No"].map((choice) => (
                      <label key={choice}>
                        <input type="radio" name="previousExperience" value={choice} checked={formData.previousExperience === choice} onChange={updateField} required />
                        {choice}
                      </label>
                    ))}
                  </div>
                </ChoiceField>
                <ChoiceField label="Can you bring your own instrument for Dhol Pathak?" required>
                  <div className="dhol-create-radio-row">
                    {["Yes", "No"].map((choice) => (
                      <label key={choice}>
                        <input type="radio" name="ownInstrument" value={choice} checked={formData.ownInstrument === choice} onChange={updateField} required />
                        {choice}
                      </label>
                    ))}
                  </div>
                </ChoiceField>
              </div>
            </section>

            <section className="dhol-create-section">
              <h2>Medical &amp; Safety</h2>
              <div className="dhol-create-grid dhol-medical-grid">
                <FormField label={<>Medical Conditions (or write "None") <b>*</b></>}>
                  <textarea name="medicalConditions" value={formData.medicalConditions} onChange={updateField} rows="4" required />
                </FormField>
                <FormField label={<>Emergency Contact <b>*</b></>}>
                  <input name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label={<>Weekly Availability <b>*</b></>}>
                  <select name="weeklyAvailability" value={formData.weeklyAvailability} onChange={updateField} required>
                    <option value="">Select weekly availability</option>
                    {["1-2 hours/week", "2-4 hours/week", "3-4 hours/week", "4-6 hours/week", "6-8 hours/week"].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                    {formData.weeklyAvailability && !["1-2 hours/week", "2-4 hours/week", "3-4 hours/week", "4-6 hours/week", "6-8 hours/week"].includes(formData.weeklyAvailability) && (
                      <option value={formData.weeklyAvailability}>{formData.weeklyAvailability}</option>
                    )}
                  </select>
                </FormField>
                <ChoiceField label="Available Practice Days (Min 4)" required>
                  <div className="dhol-create-days">
                    {practiceDays.map((day) => (
                      <label key={day}>
                        <input type="checkbox" checked={formData.practiceDays.includes(day)} onChange={() => toggleSelection("practiceDays", day)} />
                        {day}
                      </label>
                    ))}
                  </div>
                </ChoiceField>
                <ChoiceField label="Preferred Location" required>
                  <div className="dhol-create-radio-row dhol-create-location">
                    {["Narayan Peth, Pune", "Navale Bridge, Pune"].map((location) => (
                      <label key={location}>
                        <input type="radio" name="preferredLocation" value={location} checked={formData.preferredLocation === location} onChange={updateField} required />
                        {location}
                      </label>
                    ))}
                  </div>
                </ChoiceField>
              </div>
            </section>

            <section className="dhol-create-section dhol-declaration-section">
              <h2>Declaration</h2>
              <div className="dhol-create-declarations">
                {declarations.map(({ label }) => (
                  <label key={label}>
                    <input type="checkbox" checked={formData.declarations.includes(label)} onChange={() => toggleSelection("declarations", label)} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="dhol-create-grid dhol-signature-fields">
                <FormField label={<>Digital Signature (Parent Full Name) <b>*</b></>}>
                  <input name="signature" value={formData.signature} onChange={updateField} maxLength={255} required />
                </FormField>
                <FormField label={<>Date <b>*</b></>}>
                  <input name="date" type="date" value={formData.date} onChange={updateField} required />
                </FormField>
              </div>
            </section>

            {saveError && (
              <p className="dhol-form-error" role="alert">{saveError}</p>
            )}

            <div className="dhol-create-actions">
              <button type="button" className="dhol-create-cancel" onClick={backToList} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="dhol-create-save" disabled={saving}>
                {saving ? "Updating..." : "Update Application"}
              </button>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
