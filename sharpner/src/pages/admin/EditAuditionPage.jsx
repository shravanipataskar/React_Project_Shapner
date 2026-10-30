import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuditionsSidebar from "../../components/admin/AuditionsSidebar.jsx";
import { auditionsApi } from "../../services/auditionsApi";
import { useAuth } from "../../app/authContext.js";
import { 
  isValidPhoneNumber, 
  isValidEmail, 
  sanitizePhoneInput,
  getPhoneErrorMessage,
  getEmailErrorMessage
} from "../../utils/validation";
import "../../styles/pages/AuditionsPage.css";
import "../../styles/pages/CreateAuditionPage.css";

const languageOptions = ["Marathi", "Hindi", "English", "Other"];
const talentOptions = [
  "Acting",
  "Anchoring",
  "Dancing",
  "Comedy",
  "Storytelling",
  "Podcast Participation",
  "Other",
];
const consentOptions = [
  {
    value: "legalGuardian",
    label: "I am the legal parent / guardian and all above information is true.",
    field: "consent_information",
  },
  {
    value: "mediaUse",
    label:
      "I consent to the use of my child's photo, video and audition material for the selection process.",
    field: "consent_media_use",
  },
  {
    value: "promotion",
    label:
      "I have no objection to the use of promotional and digital platforms if selected.",
    field: "consent_promotion",
  },
  {
    value: "safety",
    label: "I will follow all rules given for child safety during shoot.",
    field: "consent_safety_rules",
  },
  {
    value: "selection",
    label:
      "I understand that the selection process is purely based on the creators' decision.",
    field: "consent_selection_process",
  },
  {
    value: "education",
    label: "Child's education will be prioritized.",
    field: "consent_education_priority",
  },
];

const initialForm = {
  auditionType: "",
  fullName: "",
  nickname: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  height: "",
  city: "",
  state: "",
  schoolName: "",
  hobbies: "",
  knownLanguages: [],
  otherLanguages: "",
  primaryLanguage: "",
  speakingConfidence: "",
  confidenceHelp: "",
  parentName: "",
  relationship: "",
  mobileNumber: "",
  whatsappNumber: "",
  email: "",
  parentCity: "",
  emergencyContact: "",
  talentTypes: [],
  otherTalent: "",
  previousExperience: "",
  experienceDetails: "",
  socialMediaLinks: "",
  recentCloseupPhoto: "",
  fullLengthPhoto: "",
  auditionVideo: "",
  previousWork: "",
  medicalCondition: "",
  allergies: "",
  regularMedication: "",
  medicalDetails: "",
  bloodGroup: "",
  weeklyAvailability: [],
  preferredTime: [],
  outdoorShoot: "",
  travelAvailability: "",
  guardianSignature: "",
  signatureDate: "",
  consent: [],
};

function asString(value) {
  return value === null || value === undefined ? "" : String(value);
}

function asChoice(value) {
  if ([true, 1, "1"].includes(value) || String(value).toLowerCase() === "yes") {
    return "Yes";
  }
  if (
    [false, 0, "0"].includes(value) ||
    ["false", "no"].includes(String(value).toLowerCase())
  ) {
    return "No";
  }
  return asString(value);
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(asString).filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function asDateInput(value) {
  if (!value) {
    return "";
  }
  const date = asString(value);
  const isoDate = date.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoDate) {
    return isoDate[0];
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getConsentValues(record) {
  const declarations = asArray(record.declarations);
  const acceptedValues = new Set(declarations);
  const consentByIndex = {
    0: "legalGuardian",
    1: "mediaUse",
    2: "promotion",
    3: "safety",
    4: "selection",
    5: "education",
  };

  return consentOptions
    .filter((option, index) => {
      const fieldValue = record[option.field];
      if (fieldValue !== undefined && fieldValue !== null) {
        return ["1", "true", "yes", "given"].includes(
          String(fieldValue).toLowerCase()
        );
      }
      return (
        acceptedValues.has(option.value) ||
        acceptedValues.has(String(index)) ||
        acceptedValues.has(consentByIndex[index])
      );
    })
    .map((option) => option.value);
}

function mapAuditionToForm(record) {
  return {
    ...initialForm,
    auditionType: asString(record.audition_type),
    fullName: asString(record.full_name),
    nickname: asString(record.nickname),
    dateOfBirth: asDateInput(record.date_of_birth),
    age: asString(record.age),
    gender: asString(record.gender),
    height: asString(record.height),
    city: asString(record.city),
    state: asString(record.state),
    schoolName: asString(record.school_name),
    hobbies: asString(record.hobbies),
    knownLanguages: asArray(record.languages ?? record.languages_known),
    otherLanguages: asString(record.other_language ?? record.other_languages),
    primaryLanguage: asString(record.primary_language),
    speakingConfidence: asString(record.speaking_confidence),
    confidenceHelp: asString(record.can_read_script),
    parentName: asString(record.parent_name),
    relationship: asString(record.relationship),
    mobileNumber: asString(record.mobile_number),
    whatsappNumber: asString(record.whatsapp_number),
    email: asString(record.email),
    parentCity: asString(record.parent_city),
    emergencyContact: asString(record.emergency_contact),
    talentTypes: asArray(record.talents ?? record.talent_types),
    otherTalent: asString(record.other_talent ?? record.other_talents),
    previousExperience: asChoice(record.previous_experience),
    experienceDetails: asString(record.experience_details),
    socialMediaLinks: asString(record.social_media_links),
    recentCloseupPhoto: asString(
      record.closeup_photo ??
        record.recent_closeup_photo ??
        record.recent_close_up_photo
    ),
    fullLengthPhoto: asString(record.full_length_photo),
    auditionVideo: asString(record.audition_video),
    previousWork: asString(record.previous_work),
    medicalCondition: asChoice(record.has_medical_condition),
    allergies: asChoice(record.has_allergies),
    regularMedication: asChoice(record.on_regular_medication),
    medicalDetails: asString(record.medical_details),
    bloodGroup: asString(record.blood_group),
    weeklyAvailability: asArray(record.weekly_availability),
    preferredTime: asArray(record.preferred_time_slot),
    outdoorShoot: asChoice(record.outdoor_shoot_comfort),
    travelAvailability: asChoice(record.outstation_travel),
    guardianSignature: asString(
      record.digital_signature ?? record.guardian_signature
    ),
    signatureDate: asDateInput(
      record.signature_date ?? record.declaration_date
    ),
    consent: getConsentValues(record),
  };
}

function toApiPayload(form) {
  const toBoolean = (value) => value === true || value === 1 || value === "Yes";

  return {
    audition_type: form.auditionType,
    full_name: form.fullName,
    nickname: form.nickname,
    date_of_birth: form.dateOfBirth,
    age: form.age,
    gender: form.gender,
    height: form.height,
    city: form.city,
    state: form.state,
    school_name: form.schoolName,
    hobbies: form.hobbies,
    languages: form.knownLanguages,
    other_language: form.otherLanguages,
    primary_language: form.primaryLanguage,
    speaking_confidence: form.speakingConfidence,
    can_read_script: form.confidenceHelp,
    parent_name: form.parentName,
    relationship: form.relationship,
    mobile_number: form.mobileNumber,
    whatsapp_number: form.whatsappNumber,
    email: form.email,
    parent_city: form.parentCity,
    emergency_contact: form.emergencyContact,
    talents: form.talentTypes,
    other_talent: form.otherTalent,
    previous_experience: toBoolean(form.previousExperience),
    experience_details: form.experienceDetails,
    social_media_links: form.socialMediaLinks,
    closeup_photo: form.recentCloseupPhoto,
    full_length_photo: form.fullLengthPhoto,
    audition_video: form.auditionVideo,
    previous_work: form.previousWork,
    has_medical_condition: toBoolean(form.medicalCondition),
    has_allergies: toBoolean(form.allergies),
    on_regular_medication: toBoolean(form.regularMedication),
    medical_details: form.medicalDetails,
    blood_group: form.bloodGroup,
    weekly_availability: form.weeklyAvailability.length
      ? JSON.stringify(form.weeklyAvailability)
      : null,
    preferred_time_slot: form.preferredTime.length
      ? JSON.stringify(form.preferredTime)
      : null,
    outdoor_shoot_comfort: toBoolean(form.outdoorShoot),
    outstation_travel: form.travelAvailability,
    declarations: form.consent,
    consent_information: form.consent.includes("legalGuardian"),
    consent_media_use: form.consent.includes("mediaUse"),
    consent_promotion: form.consent.includes("promotion"),
    consent_safety_rules: form.consent.includes("safety"),
    consent_selection_process: form.consent.includes("selection"),
    consent_education_priority: form.consent.includes("education"),
    digital_signature: form.guardianSignature,
    signature_date: form.signatureDate,
  };
}

function Section({ title, children }) {
  return (
    <section className="audition-form-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  options,
  value,
  onChange,
  error,
}) {
  return (
    <div className="audition-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="audition-required"> *</span>}
      </label>
      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          inputMode={type === "tel" ? "numeric" : undefined}
          maxLength={
            name === "mobileNumber" || 
            name === "whatsappNumber" || 
            name === "emergencyContact" 
              ? 10 
              : undefined
          }
        />
      )}
      {error && (
        <small className="audition-field-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </small>
      )}
    </div>
  );
}

function ChoiceGroup({ label, name, options, value, onChange, multiple }) {
  return (
    <fieldset className="audition-choice-field">
      <legend>{label}</legend>
      <div className="audition-choice-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              checked={
                multiple
                  ? value.includes(option.value)
                  : value === option.value
              }
              onChange={onChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function choices(values) {
  return [...new Set(values)].map((value) => ({ value, label: value }));
}

function getErrorMessage(error) {
  if (error.status === 404) {
    return "This audition could not be found.";
  }
  if (error.status === 405) {
    return "The connected audition API does not support updating records yet.";
  }
  return "Unable to update audition details. Please try again.";
}

export default function EditAuditionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestState, setRequestState] = useState({
    id: null,
    audition: null,
    loading: true,
    error: "",
  });
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect admin users (user_type "11" or 11) - they don't have permission to edit auditions
  useEffect(() => {
    if (user?.user_type === "11" || user?.user_type === 11) {
      navigate("/admin/auditions", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAudition() {
      try {
        const result = await auditionsApi.getById(id, {
          signal: controller.signal,
        });
        const record =
          result?.data?.data ?? result?.data ?? result?.audition ?? result;

        if (!record || Array.isArray(record) || typeof record !== "object") {
          throw new Error("The audition response did not contain a record.");
        }
        if (record.id !== undefined && String(record.id) !== String(id)) {
          throw new Error("The audition response did not match the requested ID.");
        }

        setRequestState({ id, audition: record, loading: false, error: "" });
        setFormData(mapAuditionToForm(record));
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Failed to load audition for editing:", error);
        setRequestState({
          id,
          audition: null,
          loading: false,
          error:
            error.status === 404
              ? "This audition could not be found."
              : "Unable to load audition details. Please try again.",
        });
      }
    }

    fetchAudition();
    return () => controller.abort();
  }, [id]);

  const currentRequest = requestState.id === id;
  const loading = !currentRequest || requestState.loading;
  const audition = currentRequest ? requestState.audition : null;
  const loadError = currentRequest ? requestState.error : "";

  const updateField = (event) => {
    const { name, value } = event.target;
    
    // Sanitize phone fields to allow only numeric input
    let cleanedValue = value;
    if (
      name === 'mobileNumber' || 
      name === 'whatsappNumber' || 
      name === 'emergencyContact'
    ) {
      cleanedValue = sanitizePhoneInput(value);
      // Limit to 10 digits
      if (cleanedValue.length > 10) {
        cleanedValue = cleanedValue.slice(0, 10);
      }
    }
    
    setFormData((previous) => ({ ...previous, [name]: cleanedValue }));
    setSubmitError("");
    
    // Clear field error when user edits
    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const updateCheckbox = (event) => {
    const { name, value, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: checked
        ? [...previous[name], value]
        : previous[name].filter((item) => item !== value),
    }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate phone numbers and email
    const validationErrors = {};
    
    const mobileError = getPhoneErrorMessage(formData.mobileNumber, true);
    if (mobileError) {
      validationErrors.mobileNumber = mobileError;
    }
    
    if (formData.whatsappNumber && formData.whatsappNumber.trim()) {
      const whatsappError = getPhoneErrorMessage(formData.whatsappNumber, false);
      if (whatsappError) {
        validationErrors.whatsappNumber = whatsappError;
      }
    }
    
    const emailError = getEmailErrorMessage(formData.email, true);
    if (emailError) {
      validationErrors.email = emailError;
    }
    
    const emergencyError = getPhoneErrorMessage(formData.emergencyContact, true);
    if (emergencyError) {
      validationErrors.emergencyContact = emergencyError;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError("Please fix validation errors before submitting.");
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");

    try {
      await auditionsApi.update(id, toApiPayload(formData));
      navigate("/admin/talent-show");
    } catch (error) {
      console.error("Failed to update audition:", error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => navigate("/admin/auditions");

  const existingLanguageOptions = choices([
    ...new Set([
      ...languageOptions,
      ...(formData?.knownLanguages ?? []),
      ...(formData?.primaryLanguage ? [formData.primaryLanguage] : []),
    ]),
  ]);
  const existingTalentOptions = choices([
    ...new Set([...talentOptions, ...(formData?.talentTypes ?? [])]),
  ]);
  const weeklyAvailabilityOptions = choices([
    "1-2 hours per week",
    "2-4 hours per week",
    "3-4 hours per week",
    "4-6 hours per week",
    "5+ hours per week",
    "6-8 hours per week",
    "Only Weekends",
    "Only During School Holidays",
    "Any Day Including Holidays",
    ...(formData?.weeklyAvailability ?? []),
  ]);
  const preferredTimeOptions = choices([
    "Morning (9am - 12pm)",
    "Afternoon (12pm - 4pm)",
    "Afternoon (1pm - 4pm)",
    "Evening (4pm - 6pm)",
    ...(formData?.preferredTime ?? []),
  ]);

  return (
    <div className="sharpner-create-audition audition-edit-page">
      <AuditionsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((previous) => !previous)}
      />

      <main className="audition-create-main">
        <header className="audition-create-header">
          <h1>
            <span>🎭</span>
            Edit Audition
          </h1>
          <button
            type="button"
            className="audition-back-button"
            onClick={goBack}
          >
            ← Back
          </button>
        </header>

        {loading ? (
          <div className="audition-edit-message" role="status">
            Loading audition details...
          </div>
        ) : loadError ? (
          <div className="audition-edit-message audition-edit-error" role="alert">
            <p>{loadError}</p>
            <button type="button" onClick={goBack}>
              ← Back to auditions
            </button>
          </div>
        ) : formData && audition ? (
          <form className="audition-create-form" onSubmit={handleSubmit}>
            <Section title="AUDITION TYPE">
              <Field
                label="Select Audition Type"
                name="auditionType"
                value={formData.auditionType}
                onChange={updateField}
                required
                options={[
                  { value: "", label: "Select Audition Type *" },
                  ...choices(
                    [
                      "Child Audition",
                      "General Audition",
                      formData.auditionType,
                    ].filter(Boolean)
                  ),
                ]}
              />
            </Section>

            <Section title="SECTION 1: Child Information">
              <div className="audition-form-grid">
                <Field label="Full Name" name="fullName" value={formData.fullName} onChange={updateField} required />
                <Field label="Nickname (Optional)" name="nickname" value={formData.nickname} onChange={updateField} />
                <Field label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={updateField} required />
                <Field label="Age" name="age" type="number" value={formData.age} onChange={updateField} required />
                <Field
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={updateField}
                  required
                  options={[
                    { value: "", label: "Select Gender" },
                    ...choices(
                      ["Male", "Female", "Other", formData.gender].filter(Boolean)
                    ),
                  ]}
                />
                <Field label="Height (Optional)" name="height" value={formData.height} onChange={updateField} />
                <Field label="City (Optional)" name="city" value={formData.city} onChange={updateField} />
                <Field label="State (Optional)" name="state" value={formData.state} onChange={updateField} />
                <Field label="School Name (Optional)" name="schoolName" value={formData.schoolName} onChange={updateField} />
                <Field label="Hobbies (Optional)" name="hobbies" value={formData.hobbies} onChange={updateField} />
              </div>
            </Section>

            <Section title="SECTION 2: Language Comfort & Communication">
              <ChoiceGroup
                label="Languages Known (Select all that apply) (Optional)"
                name="knownLanguages"
                options={existingLanguageOptions}
                value={formData.knownLanguages}
                onChange={updateCheckbox}
                multiple
              />
              <Field
                label="Other Languages (Optional)"
                name="otherLanguages"
                value={formData.otherLanguages}
                onChange={updateField}
                placeholder="Please specify if Other"
              />
              <ChoiceGroup
                label="Primary Comfortable Language"
                name="primaryLanguage"
                options={existingLanguageOptions}
                value={formData.primaryLanguage}
                onChange={updateField}
              />
              <ChoiceGroup
                label="Speaking Confidence Level (Optional)"
                name="speakingConfidence"
                options={choices([
                  "Very Confident",
                  "Comfortable",
                  "Needs Guidance",
                  "Beginner",
                  ...(formData.speakingConfidence
                    ? [formData.speakingConfidence]
                    : []),
                ])}
                value={formData.speakingConfidence}
                onChange={updateField}
              />
              <ChoiceGroup
                label="Can the child read scripts independently? (Optional)"
                name="confidenceHelp"
                options={choices([
                  "Yes",
                  "No",
                  "Needs Help",
                  ...(formData.confidenceHelp ? [formData.confidenceHelp] : []),
                ])}
                value={formData.confidenceHelp}
                onChange={updateField}
              />
            </Section>

            <Section title="SECTION 3: Parent / Guardian Details">
              <div className="audition-form-grid">
                <Field label="Parent Name" name="parentName" value={formData.parentName} onChange={updateField} required />
                <Field
                  label="Relationship (Optional)"
                  name="relationship"
                  value={formData.relationship}
                  onChange={updateField}
                  options={[
                    { value: "", label: "Select Relationship" },
                    ...choices(
                      [
                        "Mother",
                        "Father",
                        "Guardian",
                        "Other",
                        formData.relationship,
                      ].filter(Boolean)
                    ),
                  ]}
                />
                <Field label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={updateField} required error={fieldErrors.mobileNumber} />
                <Field label="WhatsApp Number (Optional)" name="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={updateField} error={fieldErrors.whatsappNumber} />
                <Field label="Email" name="email" type="email" value={formData.email} onChange={updateField} required error={fieldErrors.email} />
                <Field label="City" name="parentCity" value={formData.parentCity} onChange={updateField} required />
                <Field label="Emergency Contact" name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={updateField} required error={fieldErrors.emergencyContact} />
              </div>
            </Section>

            <Section title="SECTION 4: Talent Details">
              <ChoiceGroup
                label="Type of Talent (Select one or more) (Optional)"
                name="talentTypes"
                options={existingTalentOptions}
                value={formData.talentTypes}
                onChange={updateCheckbox}
                multiple
              />
              <Field
                label="Other Talent (Optional)"
                name="otherTalent"
                value={formData.otherTalent}
                onChange={updateField}
                placeholder="Please specify if Other"
              />
              <ChoiceGroup
                label="Previous Experience? (Optional)"
                name="previousExperience"
                options={choices([
                  "Yes",
                  "No",
                  ...(formData.previousExperience
                    ? [formData.previousExperience]
                    : []),
                ])}
                value={formData.previousExperience}
                onChange={updateField}
              />
              <Field
                label="If Yes, please provide details (Optional)"
                name="experienceDetails"
                type="textarea"
                value={formData.experienceDetails}
                onChange={updateField}
                placeholder="Mention shows, competitions, stage performances, etc."
              />
              <Field
                label="Social Media Profile Links (Optional)"
                name="socialMediaLinks"
                type="textarea"
                value={formData.socialMediaLinks}
                onChange={updateField}
                placeholder="Instagram / YouTube / Facebook links"
              />
            </Section>

            <Section title="SECTION 5: Upload Section">
              <div className="audition-upload-notice">
                📋 Upload Instructions: Please upload your photos/videos to
                Google Drive, make them publicly accessible, and paste the
                shareable links below. Existing media links are preserved in
                these fields.
              </div>
              <div className="audition-form-grid">
                <Field label="Recent Close-up Photo *" name="recentCloseupPhoto" value={formData.recentCloseupPhoto} onChange={updateField} placeholder="Paste Google Drive link" required />
                <Field label="Full Length Photo *" name="fullLengthPhoto" value={formData.fullLengthPhoto} onChange={updateField} placeholder="Paste Google Drive link" required />
                <Field label="1–2 Minute Audition Video *" name="auditionVideo" value={formData.auditionVideo} onChange={updateField} placeholder="Paste Google Drive link" required />
                <Field label="Optional Previous Work (Video)" name="previousWork" value={formData.previousWork} onChange={updateField} placeholder="Paste Google Drive link (optional)" />
              </div>
            </Section>

            <Section title="SECTION 6: Basic Medical & Safety Declaration">
              <div className="audition-form-grid audition-medical-grid">
                <Field
                  label="Does the child have any serious medical condition? (Optional)"
                  name="medicalCondition"
                  value={formData.medicalCondition}
                  onChange={updateField}
                  options={[
                    { value: "", label: "Select" },
                    ...choices(
                      [
                        "No",
                        "Yes",
                        ...(formData.medicalCondition
                          ? [formData.medicalCondition]
                          : []),
                      ]
                    ),
                  ]}
                />
                <Field
                  label="Any Allergies? (Optional)"
                  name="allergies"
                  value={formData.allergies}
                  onChange={updateField}
                  options={[
                    { value: "", label: "Select" },
                    ...choices([
                      "No",
                      "Yes",
                      ...(formData.allergies ? [formData.allergies] : []),
                    ]),
                  ]}
                />
                <Field
                  label="On any regular medication? (Optional)"
                  name="regularMedication"
                  value={formData.regularMedication}
                  onChange={updateField}
                  options={[
                    { value: "", label: "Select" },
                    ...choices([
                      "No",
                      "Yes",
                      ...(formData.regularMedication
                        ? [formData.regularMedication]
                        : []),
                    ]),
                  ]}
                />
                <Field
                  label="If Yes, please briefly explain (Optional)"
                  name="medicalDetails"
                  type="textarea"
                  value={formData.medicalDetails}
                  onChange={updateField}
                />
                <Field
                  label="Blood Group (Optional)"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={updateField}
                  placeholder="Example: O+, A+, B+"
                />
              </div>
              <p className="audition-helper-text">
                Note: This medical information will be used strictly for safety
                purposes during auditions and shoots and will remain
                confidential.
              </p>
            </Section>

            <Section title="SECTION 7: Availability & Schedule">
              <div className="audition-form-grid">
                <ChoiceGroup
                  label="Weekly Availability"
                  name="weeklyAvailability"
                  options={weeklyAvailabilityOptions}
                  value={formData.weeklyAvailability}
                  onChange={updateCheckbox}
                  multiple
                />
                <ChoiceGroup
                  label="Preferred Time Slot"
                  name="preferredTime"
                  options={preferredTimeOptions}
                  value={formData.preferredTime}
                  onChange={updateCheckbox}
                  multiple
                />
                <ChoiceGroup
                  label="Outdoor Shoot Comfort"
                  name="outdoorShoot"
                  options={choices([
                    "Yes",
                    "No",
                    ...(formData.outdoorShoot ? [formData.outdoorShoot] : []),
                  ])}
                  value={formData.outdoorShoot}
                  onChange={updateField}
                />
                <ChoiceGroup
                  label="Outstation Travel Availability"
                  name="travelAvailability"
                  options={choices([
                    "Yes",
                    "No",
                    "Depends on Schedule",
                    ...(formData.travelAvailability
                      ? [formData.travelAvailability]
                      : []),
                  ])}
                  value={formData.travelAvailability}
                  onChange={updateField}
                />
              </div>
              <div className="audition-upload-notice">
                Note: Working hours will always comply with child safety
                guidelines and applicable laws. Parent presence is mandatory.
              </div>
            </Section>

            <Section title="SECTION 8: Parent / Guardian Consent & Declaration">
              <ChoiceGroup
                label="I confirm the following statements are true:"
                name="consent"
                options={consentOptions}
                value={formData.consent}
                onChange={updateCheckbox}
                multiple
              />
              <div className="audition-form-grid audition-signature-grid">
                <Field
                  label="Digital Signature (Parent / Guardian Full Name)"
                  name="guardianSignature"
                  value={formData.guardianSignature}
                  onChange={updateField}
                  placeholder="Type full name as signature"
                  required
                />
                <Field
                  label="Date"
                  name="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={updateField}
                  required
                />
              </div>
            </Section>

            {submitError && (
              <p className="audition-form-feedback audition-form-feedback-error" role="alert">
                {submitError}
              </p>
            )}

            <div className="audition-form-actions">
              <button
                type="button"
                className="audition-cancel-button"
                onClick={goBack}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="audition-save-button"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Audition"}
              </button>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
