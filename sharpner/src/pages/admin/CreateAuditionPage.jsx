
import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  adminNavigationItems,
  isAdminNavigationItemActive,
} from "../../components/layout/adminNavigation.js";
import "../../styles/pages/CreateAuditionPage.css";

const Section = ({ title, children }) => (
  <section className="audition-form-section">
    <h2>{title}</h2>
    {children}
  </section>
);

const Field = ({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  options,
  value,
  onChange,
}) => (
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
      />
    )}
  </div>
);

const RadioGroup = ({ label, name, options, value, onChange }) => (
  <fieldset className="audition-choice-field">
    <legend>{label}</legend>
    <div className="audition-choice-options">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  </fieldset>
);

const CheckboxGroup = ({ label, name, options, values, onChange }) => (
  <fieldset className="audition-choice-field">
    <legend>{label}</legend>
    <div className="audition-choice-options">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={values.includes(option.value)}
            onChange={onChange}
          />
          {option.label}
        </label>
      ))}
    </div>
  </fieldset>
);

const getLocalDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export default function CreateAuditionPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
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
    relationship: "Mother",
    mobileNumber: "",
    whatsappNumber: "",
    email: "",
    parentCity: "",
    emergencyContact: "",
    talentTypes: [],
    previousExperience: "",
    experienceDetails: "",
    socialMediaLinks: "",
    recentCloseupPhoto: "",
    fullLengthPhoto: "",
    auditionVideo: "",
    previousWork: "",
    medicalCondition: "No",
    allergies: "No",
    regularMedication: "No",
    medicalDetails: "",
    bloodGroup: "",
    weeklyAvailability: [],
    preferredTime: [],
    outdoorShoot: "",
    travelAvailability: "",
    guardianSignature: "",
    signatureDate: getLocalDate(),
    consent: [],
  });

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateCheckbox = (event) => {
    const { name, value, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked
        ? [...previous[name], value]
        : previous[name].filter((item) => item !== value),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // UI only: no database submission is implemented.
    window.alert(
      "Audition form UI is ready. Database integration is not connected yet."
    );
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      navigate("/login");
    }
  };

  const languageOptions = [
    { value: "Marathi", label: "Marathi" },
    { value: "Hindi", label: "Hindi" },
    { value: "English", label: "English" },
    { value: "Other", label: "Other" },
  ];

  const talentOptions = [
    { value: "Acting", label: "Acting" },
    { value: "Anchoring", label: "Anchoring" },
    { value: "Dancing", label: "Dancing" },
    { value: "Comedy", label: "Comedy" },
    { value: "Storytelling", label: "Storytelling" },
    { value: "Podcast Participation", label: "Podcast Participation" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="sharpner-create-audition">
      <button
        className="audition-mobile-toggle"
        type="button"
        onClick={() => setSidebarOpen((previous) => !previous)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="audition-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`audition-sidebar ${
          sidebarOpen ? "audition-sidebar-open" : ""
        }`}
      >
        <div className="audition-sidebar-brand">
          <Link to="/dashboard">SHARPNER</Link>
        </div>

        <nav className="audition-navigation">
          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `audition-nav-link ${
                  isActive || isAdminNavigationItemActive(item, pathname)
                    ? "audition-nav-active"
                    : ""
                }`
              }
            >
              <span className="audition-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className="audition-signout"
            onClick={handleSignOut}
          >
            <span>⇥</span> Sign Out
          </button>
        </nav>
      </aside>

      <main className="audition-create-main">
        <header className="audition-create-header">
          <h1>
            <span>🎭</span>
            Add New Audition
          </h1>

          <button
            type="button"
            className="audition-back-button"
            onClick={() => navigate("/admin/auditions")}
          >
            ← Back
          </button>
        </header>

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
                { value: "Child Audition", label: "Child Audition" },
                { value: "General Audition", label: "General Audition" },
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
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
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
            <CheckboxGroup
              label="Languages Known (Select all that apply) (Optional)"
              name="knownLanguages"
              options={languageOptions}
              values={formData.knownLanguages}
              onChange={updateCheckbox}
            />

            <Field
              label="Other Languages (Optional)"
              name="otherLanguages"
              value={formData.otherLanguages}
              onChange={updateField}
              placeholder="Please specify if Other"
            />

            <RadioGroup
              label="Primary Comfortable Language"
              name="primaryLanguage"
              options={languageOptions}
              value={formData.primaryLanguage}
              onChange={updateField}
            />

            <RadioGroup
              label="Speaking Confidence Level (Optional)"
              name="speakingConfidence"
              options={[
                { value: "Very Confident", label: "Very Confident (Camera Friendly)" },
                { value: "Comfortable", label: "Comfortable" },
                { value: "Needs Guidance", label: "Needs Guidance" },
                { value: "Beginner", label: "Beginner" },
              ]}
              value={formData.speakingConfidence}
              onChange={updateField}
            />

            <RadioGroup
              label="Can the child read scripts independently? (Optional)"
              name="confidenceHelp"
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
                { value: "Needs Help", label: "Needs Help" },
              ]}
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
                  { value: "Mother", label: "Mother" },
                  { value: "Father", label: "Father" },
                  { value: "Guardian", label: "Guardian" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <Field label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={updateField} required />
              <Field label="WhatsApp Number (Optional)" name="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={updateField} />
              <Field label="Email" name="email" type="email" value={formData.email} onChange={updateField} required />
              <Field label="City" name="parentCity" value={formData.parentCity} onChange={updateField} required />
              <Field label="Emergency Contact" name="emergencyContact" type="tel" value={formData.emergencyContact} onChange={updateField} required />
            </div>
          </Section>

          <Section title="SECTION 4: Talent Details">
            <CheckboxGroup
              label="Type of Talent (Select one or more) (Optional)"
              name="talentTypes"
              options={talentOptions}
              values={formData.talentTypes}
              onChange={updateCheckbox}
            />

            <RadioGroup
              label="Previous Experience? (Optional)"
              name="previousExperience"
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
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
              📋 Upload Instructions: Please upload your photos/videos to Google
              Drive, make them publicly accessible, and paste the shareable
              links below.
            </div>

            <div className="audition-form-grid">
              <Field label="Recent Close-Up Photo Link" name="recentCloseupPhoto" value={formData.recentCloseupPhoto} onChange={updateField} placeholder="Paste Google Drive link" required />
              <Field label="Full Length Photo Link" name="fullLengthPhoto" value={formData.fullLengthPhoto} onChange={updateField} placeholder="Paste Google Drive link" required />
              <Field label="1-2 Minute Audition Video" name="auditionVideo" value={formData.auditionVideo} onChange={updateField} placeholder="Paste Google Drive link" required />
              <Field label="Optional Previous Work" name="previousWork" value={formData.previousWork} onChange={updateField} placeholder="Paste Google Drive link (optional)" />
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
                  { value: "No", label: "No" },
                  { value: "Yes", label: "Yes" },
                ]}
              />

              <Field
                label="Any Allergies? (Optional)"
                name="allergies"
                value={formData.allergies}
                onChange={updateField}
                options={[
                  { value: "No", label: "No" },
                  { value: "Yes", label: "Yes" },
                ]}
              />

              <Field
                label="On any regular medication? (Optional)"
                name="regularMedication"
                value={formData.regularMedication}
                onChange={updateField}
                options={[
                  { value: "No", label: "No" },
                  { value: "Yes", label: "Yes" },
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
              purposes during auditions and shoots and will remain confidential.
            </p>
          </Section>

          <Section title="SECTION 7: Availability & Schedule">
            <div className="audition-form-grid">
              <CheckboxGroup
                label="Weekly Availability"
                name="weeklyAvailability"
                options={[
                  { value: "2-4 hours per week", label: "2-4 hours per week" },
                  { value: "4-6 hours per week", label: "4-6 hours per week" },
                  { value: "6-8 hours per week", label: "6-8 hours per week" },
                  { value: "Only Weekends", label: "Only Weekends" },
                  { value: "Any Day Including Holidays", label: "Any Day Including Holidays" },
                ]}
                values={formData.weeklyAvailability}
                onChange={updateCheckbox}
              />

              <CheckboxGroup
                label="Preferred Time Slot"
                name="preferredTime"
                options={[
                  { value: "Morning (9am - 12pm)", label: "Morning (9am - 12pm)" },
                  { value: "Afternoon (1pm - 4pm)", label: "Afternoon (1pm - 4pm)" },
                  { value: "Evening (4pm - 6pm)", label: "Evening (4pm - 6pm)" },
                ]}
                values={formData.preferredTime}
                onChange={updateCheckbox}
              />

              <RadioGroup
                label="Outdoor Shoot Comfort"
                name="outdoorShoot"
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                value={formData.outdoorShoot}
                onChange={updateField}
              />

              <RadioGroup
                label="Outstation Travel Availability"
                name="travelAvailability"
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                  { value: "Depends on Schedule", label: "Depends on Schedule" },
                ]}
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
            <CheckboxGroup
              label="I confirm the following statements are true:"
              name="consent"
              options={[
                { value: "legalGuardian", label: "I am the legal parent / guardian and all above information is true." },
                { value: "processing", label: "I consent to the use of my child's photos, videos and audition material for the selection process." },
                { value: "permission", label: "I have no objection to the use of the promotional and digital platform if selected." },
                { value: "safety", label: "I will not ask or force my child to do anything unsafe." },
                { value: "decision", label: "I understand that the selection process is purely based on the audition decision." },
                { value: "privacy", label: "I confirm that all information provided is accurate." },
              ]}
              values={formData.consent}
              onChange={updateCheckbox}
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

          <div className="audition-form-actions">
            <button
              type="button"
              className="audition-cancel-button"
              onClick={() => navigate("/admin/auditions")}
            >
              Cancel
            </button>

            <button type="submit" className="audition-save-button">
              Save Audition
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
