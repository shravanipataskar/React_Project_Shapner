
import { useState } from "react";
import "../../styles/pages/ChildAuditionForm.css";

const steps = [
  "Child Info",
  "Language",
  "Parent Details",
  "Talent Details",
  "Media Upload",
  "Medical Details",
  "Availability",
  "Consent",
];

const initialForm = {
  full_name: "",
  nickname: "",
  date_of_birth: "",
  age: "",
  gender: "",
  height: "",
  city: "",
  state: "",
  school_name: "",
  hobbies: "",

  languages: [],
  other_language: "",
  primary_language: "",
  speaking_confidence: "",
  can_read_script: "",

  parent_name: "",
  relationship: "Mother",
  mobile_number: "",
  whatsapp_number: "",
  email: "",
  parent_city: "",
  emergency_contact: "",

  talents: [],
  other_talent: "",
  previous_experience: "",
  experience_details: "",
  social_media_links: "",

  closeup_photo: "",
  full_length_photo: "",
  audition_video: "",
  previous_work: "",

  has_medical_condition: "No",
  has_allergies: "No",
  on_regular_medication: "No",
  medical_details: "",
  blood_group: "",

  weekly_availability: "3-4 hours per week",
  preferred_time_slot: "Afternoon (12pm - 4pm)",
  outdoor_shoot_comfort: "No",
  outstation_travel: "No",

  declarations: [],
  guardian_signature: "",
  declaration_date: new Date().toISOString().slice(0, 10),
};

const declarationTexts = [
  "I am the legal parent / guardian and all above information is true.",
  "I consent to the use of my child's photo, video and audition material for the selection process.",
  "I have no objection to the use of promotional and digital platforms if selected.",
  "I will follow all rules given for child safety during shoot.",
  "I understand that the selection process is purely based on the creators' decision.",
  "Child's education will be prioritized.",
];

function ChildAuditionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const toggleArrayValue = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 0) {
      if (!form.full_name.trim()) {
        nextErrors.full_name = "Please enter the child's full name.";
      }

      if (!form.date_of_birth) {
        nextErrors.date_of_birth = "Please select the date of birth.";
      }

      if (!form.gender) {
        nextErrors.gender = "Please select a gender.";
      }

      if (!form.city.trim()) {
        nextErrors.city = "Please enter the city.";
      }

      if (!form.age || Number(form.age) <= 0) {
        nextErrors.age = "Please enter a valid age.";
      }
    }

    if (currentStep === 1 && !form.primary_language) {
      nextErrors.primary_language = "Please select the primary language.";
    }

    if (currentStep === 2) {
      if (!form.parent_name.trim()) {
        nextErrors.parent_name = "Please enter the parent/guardian name.";
      }

      if (!/^[0-9]{10}$/.test(form.mobile_number)) {
        nextErrors.mobile_number = "Enter a valid 10-digit mobile number.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!form.parent_city.trim()) {
        nextErrors.parent_city = "Please enter the city.";
      }

      if (!form.emergency_contact.trim()) {
        nextErrors.emergency_contact = "Please enter an emergency contact.";
      }
    }

    if (currentStep === 4) {
      if (!form.closeup_photo.trim()) {
        nextErrors.closeup_photo = "Please provide a close-up photo link.";
      }

      if (!form.full_length_photo.trim()) {
        nextErrors.full_length_photo = "Please provide a full-length photo link.";
      }

      if (!form.audition_video.trim()) {
        nextErrors.audition_video = "Please provide an audition video link.";
      }
    }

    if (currentStep === 6) {
      if (!form.weekly_availability) {
        nextErrors.weekly_availability = "Please select your availability.";
      }

      if (!form.preferred_time_slot) {
        nextErrors.preferred_time_slot = "Please select a preferred time slot.";
      }
    }

    if (currentStep === 7) {
      if (form.declarations.length !== declarationTexts.length) {
        nextErrors.declarations = "Please accept all required declarations.";
      }

      if (!form.guardian_signature.trim()) {
        nextErrors.guardian_signature = "Please enter the guardian's full name.";
      }

      if (!form.declaration_date) {
        nextErrors.declaration_date = "Please select the date.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 0));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDateOfBirth = (value) => {
    let calculatedAge = "";

    if (value) {
      const birthDate = new Date(`${value}T00:00:00`);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();

      const birthdayNotReached =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate());

      if (birthdayNotReached) {
        age -= 1;
      }

      calculatedAge = age >= 0 ? String(age) : "";
    }

    setForm((previous) => ({
      ...previous,
      date_of_birth: value,
      age: calculatedAge,
    }));

    setErrors((previous) => ({
      ...previous,
      date_of_birth: "",
      age: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    setSubmitting(true);

    try {
      /*
       * This is the frontend-only version.
       *
       * To save submissions in your Laravel database, connect this
       * function to a Laravel API endpoint and replace the success
       * handling below with the API response.
       */

      console.log("Child audition registration:", form);

      setShowSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({
        submit: "Unable to submit the registration. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (
    label,
    name,
    placeholder = "",
    type = "text",
    options = {}
  ) => (
    <div className={`audition-field ${options.full ? "field-full" : ""}`}>
      <label htmlFor={name}>
        {label}
        {options.required && <span className="required-mark"> *</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(event) => updateField(name, event.target.value)}
        required={Boolean(options.required)}
      />

      {errors[name] && (
        <small className="audition-error">{errors[name]}</small>
      )}
    </div>
  );

  const renderSelect = (label, name, choices, options = {}) => (
    <div className={`audition-field ${options.full ? "field-full" : ""}`}>
      <label htmlFor={name}>
        {label}
        {options.required && <span className="required-mark"> *</span>}
      </label>

      <select
        id={name}
        name={name}
        value={form[name]}
        onChange={(event) => updateField(name, event.target.value)}
      >
        <option value="">Select {label}</option>

        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>

      {errors[name] && (
        <small className="audition-error">{errors[name]}</small>
      )}
    </div>
  );

  const renderRadioGroup = (label, name, choices) => (
    <div className="audition-choice-group">
      <label className="audition-choice-title">{label}</label>

      <div className="audition-radio-options">
        {choices.map((choice) => (
          <label className="audition-radio" key={choice}>
            <input
              type="radio"
              name={name}
              value={choice}
              checked={form[name] === choice}
              onChange={(event) => updateField(name, event.target.value)}
            />

            <span>{choice}</span>
          </label>
        ))}
      </div>

      {errors[name] && (
        <small className="audition-error">{errors[name]}</small>
      )}
    </div>
  );

  const renderCheckboxGroup = (label, name, choices) => (
    <div className="audition-choice-group">
      <label className="audition-choice-title">{label}</label>

      <div className="audition-checkbox-options">
        {choices.map((choice) => (
          <label className="audition-checkbox" key={choice}>
            <input
              type="checkbox"
              checked={form[name].includes(choice)}
              onChange={() => toggleArrayValue(name, choice)}
            />

            <span>{choice}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderTextarea = (
    label,
    name,
    placeholder = "",
    options = {}
  ) => (
    <div className={`audition-field ${options.full ? "field-full" : ""}`}>
      <label htmlFor={name}>
        {label}
        {options.required && <span className="required-mark"> *</span>}
      </label>

      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={form[name]}
        rows={options.rows || 4}
        onChange={(event) => updateField(name, event.target.value)}
      />

      {errors[name] && (
        <small className="audition-error">{errors[name]}</small>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 1: Child Information
            </h3>

            <div className="audition-grid">
              {renderInput("Full Name", "full_name", "Enter full name", "text", {
                required: true,
              })}

              {renderInput("Nickname (Optional)", "nickname", "Enter nickname")}

              {renderInput("Date of Birth", "date_of_birth", "", "date", {
                required: true,
              })}

              {renderInput("Age", "age", "Age", "number", {
                required: true,
              })}

              {renderSelect(
                "Gender",
                "gender",
                ["Male", "Female", "Other"],
                { required: true }
              )}

              {renderInput("Height (Optional)", "height", "Height")}

              {renderInput("City", "city", "Enter city", "text", {
                required: true,
              })}

              {renderInput("State", "state", "Enter state")}

              {renderInput("School Name (Optional)", "school_name", "School name")}

              {renderInput("Hobbies (Optional)", "hobbies", "Enter hobbies")}
            </div>
          </>
        );

      case 1:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 2: Language Comfort & Communication
            </h3>

            {renderCheckboxGroup(
              "Languages Known (Select all that apply) (Optional)",
              "languages",
              ["Marathi", "Hindi", "English", "Other"]
            )}

            {form.languages.includes("Other") &&
              renderInput(
                "Specify Other Language",
                "other_language",
                "Please specify"
              )}

            <div className="audition-spacer" />

            {renderRadioGroup(
              "Primary Comfortable Language",
              "primary_language",
              ["Marathi", "Hindi", "English", "Other"]
            )}

            {errors.primary_language && (
              <small className="audition-error">
                {errors.primary_language}
              </small>
            )}

            <div className="audition-spacer" />

            {renderRadioGroup(
              "Speaking Confidence Level (Optional)",
              "speaking_confidence",
              [
                "Very Confident (Camera Friendly)",
                "Comfortable",
                "Needs Guidance",
                "Beginner",
              ]
            )}

            <div className="audition-spacer" />

            {renderRadioGroup(
              "Can the child read script independently? (Optional)",
              "can_read_script",
              ["Yes", "No", "Needs Help"]
            )}
          </>
        );

      case 2:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 3: Parent / Guardian Details
            </h3>

            <div className="audition-grid">
              {renderInput("Parent Name", "parent_name", "Parent / guardian name", "text", {
                required: true,
              })}

              {renderSelect("Relationship", "relationship", [
                "Mother",
                "Father",
                "Guardian",
              ])}

              {renderInput("Mobile Number", "mobile_number", "10-digit mobile number", "tel", {
                required: true,
              })}

              {renderInput("WhatsApp Number (Optional)", "whatsapp_number", "WhatsApp number", "tel")}

              {renderInput("Email", "email", "Enter email address", "email", {
                required: true,
              })}

              {renderInput("City", "parent_city", "Enter city", "text", {
                required: true,
              })}

              {renderInput("Emergency Contact", "emergency_contact", "Emergency contact number", "tel", {
                required: true,
              })}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 4: Talent Details
            </h3>

            {renderCheckboxGroup(
              "Type of Talent (Select one or more) (Optional)",
              "talents",
              [
                "Acting",
                "Anchoring",
                "Dancing",
                "Comedy",
                "Storytelling",
                "Podcast Participation",
                "Other",
              ]
            )}

            {form.talents.includes("Other") &&
              renderInput(
                "Specify Other Talent",
                "other_talent",
                "If other, please specify",
                "text",
                { full: true }
              )}

            <div className="audition-spacer" />

            {renderRadioGroup(
              "Previous Experience? (Optional)",
              "previous_experience",
              ["Yes", "No"]
            )}

            {form.previous_experience === "Yes" &&
              renderTextarea(
                "If Yes, please provide details",
                "experience_details",
                "Mention shows, competitions, stage performances, etc.",
                { full: true }
              )}

            {renderTextarea(
              "Social Media Profile Links (Optional)",
              "social_media_links",
              "Instagram / YouTube / Facebook links",
              { full: true }
            )}
          </>
        );

      case 4:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 5: Upload Section
            </h3>

            <div className="audition-info-box">
              📤 <strong>Upload Instructions:</strong> Please upload your
              photos/videos to Google Drive, make them public, and paste the
              shareable links below.
            </div>

            <div className="audition-grid">
              {renderInput(
                "Recent Close-Up Photo",
                "closeup_photo",
                "Paste Google Drive link",
                "url",
                { required: true }
              )}

              {renderInput(
                "Full Length Photo",
                "full_length_photo",
                "Paste Google Drive link",
                "url",
                { required: true }
              )}

              {renderInput(
                "1–2 Minute Audition Video",
                "audition_video",
                "Paste Google Drive link",
                "url",
                { required: true }
              )}

              {renderInput(
                "Optional Previous Work",
                "previous_work",
                "Paste Google Drive link",
                "url"
              )}
            </div>

            <p className="audition-help-text">
              Upload your files to Google Drive, enable link sharing, and
              paste the accessible links above.
            </p>
          </>
        );

      case 5:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 6: Basic Medical & Safety Declaration
            </h3>

            <div className="audition-grid">
              {renderSelect(
                "Does the child have any serious medical condition?",
                "has_medical_condition",
                ["No", "Yes"]
              )}

              {renderSelect("Any allergies?", "has_allergies", ["No", "Yes"])}

              {renderSelect(
                "On any regular medication?",
                "on_regular_medication",
                ["No", "Yes"]
              )}

              {renderInput("Blood Group (Optional)", "blood_group", "Example: O+, A-, B+")}

              {(form.has_medical_condition === "Yes" ||
                form.has_allergies === "Yes" ||
                form.on_regular_medication === "Yes") &&
                renderTextarea(
                  "If Yes, please briefly explain",
                  "medical_details",
                  "Explain medical conditions, allergies or medication if applicable",
                  { full: true }
                )}
            </div>

            <p className="audition-help-text">
              Note: This medical information will be used strictly for safety
              purposes during auditions and shoots and will remain confidential.
            </p>
          </>
        );

      case 6:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 7: Availability & Schedule
            </h3>

            <div className="audition-grid">
              {renderRadioGroup(
                "Weekly Availability",
                "weekly_availability",
                [
                  "1-2 hours per week",
                  "3-4 hours per week",
                  "5-8 hours per week",
                  "Only Weekends",
                  "Only During School Holidays",
                ]
              )}

              {renderRadioGroup(
                "Preferred Time Slot",
                "preferred_time_slot",
                [
                  "Morning (8am - 12pm)",
                  "Afternoon (12pm - 4pm)",
                  "Evening (4pm - 8pm)",
                ]
              )}

              {renderRadioGroup(
                "Outdoor Shoot Comfort",
                "outdoor_shoot_comfort",
                ["Yes", "No"]
              )}

              {renderRadioGroup(
                "Outstation Travel Availability",
                "outstation_travel",
                ["Yes", "No", "Depends on Schedule"]
              )}
            </div>

            <div className="audition-info-box">
              <strong>Note:</strong> Working hours will always comply with
              child safety guidelines and applicable laws. Parent presence is
              mandatory.
            </div>
          </>
        );

      case 7:
        return (
          <>
            <h3 className="audition-card-heading">
              SECTION 8: Parent / Guardian Consent & Declaration
            </h3>

            <div className="audition-declarations">
              {declarationTexts.map((declaration, index) => (
                <label className="audition-declaration" key={declaration}>
                  <input
                    type="checkbox"
                    checked={form.declarations.includes(String(index))}
                    onChange={() =>
                      toggleArrayValue("declarations", String(index))
                    }
                  />

                  <span>{declaration} *</span>
                </label>
              ))}
            </div>

            {errors.declarations && (
              <small className="audition-error">
                {errors.declarations}
              </small>
            )}

            <div className="audition-grid audition-consent-grid">
              {renderInput(
                "Digital Signature (Parent / Guardian Full Name)",
                "guardian_signature",
                "Enter full name",
                "text",
                { required: true }
              )}

              {renderInput(
                "Date",
                "declaration_date",
                "",
                "date",
                { required: true }
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <main className="child-audition-page">
      <div className="audition-container">
        <section className="audition-intro">
          <h2>Casting New Child Artists</h2>

          <p>
            We are looking for new child artists for upcoming digital projects.
            If your child enjoys acting, anchoring, dancing, comedy, or
            storytelling, please fill out the application form below.
          </p>
        </section>

        <div className="audition-divider" />

        <section className="audition-registration-heading">
          <h2>🎬 Audition Registration</h2>

          <p>
            Join our talent pool and showcase your skills! Fill out the form
            below to register for upcoming auditions.
          </p>
        </section>

        <form onSubmit={handleSubmit} noValidate>
          <div className="audition-layout">
            <aside className="audition-steps">
              <h2>Registration Steps</h2>

              <div className="audition-steps-list">
                {steps.map((step, index) => (
                  <button
                    type="button"
                    key={step}
                    className={`audition-step ${
                      index <= currentStep ? "completed" : ""
                    } ${index === currentStep ? "active" : ""}`}
                    onClick={() => {
                      if (index <= currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <span className="audition-step-number">{index + 1}</span>

                    <span className="audition-step-label">{step}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="audition-form-column">
              <section className="audition-form-card">
                {renderStepContent()}

                {errors.submit && (
                  <p className="audition-error">{errors.submit}</p>
                )}
              </section>

              <div className="audition-navigation">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    className="audition-previous"
                    onClick={handlePrevious}
                  >
                    ← Previous
                  </button>
                ) : (
                  <span />
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    className="audition-next"
                    onClick={handleNext}
                  >
                    NEXT →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="audition-next audition-submit"
                    disabled={submitting}
                  >
                    {submitting ? "SUBMITTING..." : "SUBMIT REGISTRATION"}
                  </button>
                )}
              </div>
            </div>

            <div className="audition-child-image" aria-hidden="true">
              <img src="/assets/images/audition-child.png" alt="" />
            </div>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="audition-modal-overlay">
          <div
            className="audition-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audition-success-title"
          >
            <div className="audition-success-icon">💡</div>

            <h2 id="audition-success-title">Registration Submitted!</h2>

            <p>
              Thank you for registering. Our team will review the application
              soon.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSuccess(false);
                setCurrentStep(0);
                setForm({
                  ...initialForm,
                  declaration_date: new Date().toISOString().slice(0, 10),
                });

                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ChildAuditionForm;
