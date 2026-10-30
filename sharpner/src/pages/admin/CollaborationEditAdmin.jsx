import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { collaborationsApi } from "../../services/collaborationsApi.js";
import { 
  isValidPhoneNumber, 
  isValidEmail, 
  sanitizePhoneInput,
  getPhoneErrorMessage,
  getEmailErrorMessage
} from "../../utils/validation";
import { useAuth } from "../../app/authContext.js";
import { hasSuperAdminAccess } from "../../utils/userTypes.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/CollaborationsAdmin.css";
import "../../styles/pages/CollaborationCreateAdmin.css";

const EMPTY_FORM = {
  name: "",
  organization_name: "",
  brand_name: "",
  contact_person: "",
  collaboration_type: "",
  email: "",
  phone_number: "",
  instagram_or_website: "",
  type_of_promotion: "",
  budget_range: "",
  campaign_goal: "",
  message: "",
  commercial_inquiry: false,
  review_status: "0",
};

function CollaborationEditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect non-super-admin users - only super admin can edit
  useEffect(() => {
    if (!hasSuperAdminAccess(user)) {
      navigate('/admin/collaborations', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let active = true;

    async function loadCollaboration() {
      setLoading(true);
      setError("");

      try {
        const result = await collaborationsApi.getById(id);
        const record = result?.data ?? result;

        if (result?.success === false || !record?.id) {
          throw new Error(result?.message || "Brand Deal not found.");
        }

        if (active) {
          setFormData({
            name: record.name ?? "",
            organization_name: record.organization_name ?? "",
            brand_name: record.brand_name ?? "",
            contact_person: record.contact_person ?? "",
            collaboration_type: record.collaboration_type ?? "",
            email: record.email ?? "",
            phone_number: record.phone_number ?? "",
            instagram_or_website: record.instagram_or_website ?? "",
            type_of_promotion: record.type_of_promotion ?? "",
            budget_range: record.budget_range ?? "",
            campaign_goal: record.campaign_goal ?? "",
            message: record.message ?? "",
            commercial_inquiry: Boolean(record.commercial_inquiry),
            review_status: String(record.review_status ?? 0),
          });
        }
      } catch (requestError) {
        if (active) {
          console.error("Failed to load Brand Deal for editing:", requestError);
          setError(requestError.message || "Unable to load this Brand Deal.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCollaboration();

    return () => {
      active = false;
    };
  }, [id]);

  function updateField(field, value) {
    // Sanitize phone fields to allow only numeric input
    let cleanedValue = value;
    if (field === 'phone_number') {
      cleanedValue = sanitizePhoneInput(value);
      // Limit to 10 digits
      if (cleanedValue.length > 10) {
        cleanedValue = cleanedValue.slice(0, 10);
      }
    }
    
    setFormData((previous) => ({ ...previous, [field]: cleanedValue }));
    setError("");
    
    // Clear field error when user edits
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (
      !formData.brand_name.trim() ||
      !formData.contact_person.trim() ||
      !formData.email.trim()
    ) {
      setError("Brand Name, Contact Person, and Email are required.");
      return;
    }

    // Validate phone and email
    const validationErrors = {};
    
    const emailError = getEmailErrorMessage(formData.email, true);
    if (emailError) {
      validationErrors.email = emailError;
    }
    
    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneError = getPhoneErrorMessage(formData.phone_number, false);
      if (phoneError) {
        validationErrors.phone_number = phoneError;
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please fix validation errors before submitting.");
      return;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await collaborationsApi.update(id, {
        ...formData,
        name: formData.name.trim() || null,
        organization_name: formData.organization_name.trim() || null,
        brand_name: formData.brand_name.trim(),
        contact_person: formData.contact_person.trim(),
        collaboration_type: formData.collaboration_type.trim() || "brand",
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || null,
        instagram_or_website: formData.instagram_or_website.trim() || null,
        type_of_promotion: formData.type_of_promotion.trim() || null,
        budget_range: formData.budget_range.trim() || null,
        campaign_goal: formData.campaign_goal.trim() || null,
        message: formData.message.trim() || null,
      });
      navigate("/admin/collaborations");
    } catch (requestError) {
      console.error("Failed to update Brand Deal:", requestError);
      setError(requestError.message || "Unable to update this Brand Deal.");
    } finally {
      setSaving(false);
    }
  }

  function renderInput(label, name, type = "text", required = false) {
    const isPhone = name === 'phone_number';
    
    return (
      <label className="collaboration-create-field" key={name}>
        <span>{label}{required ? " *" : ""}</span>
        <input
          name={name}
          type={type}
          value={formData[name]}
          onChange={(event) => updateField(name, event.target.value)}
          required={required}
          inputMode={isPhone ? "numeric" : undefined}
          maxLength={isPhone ? 10 : undefined}
        />
        {fieldErrors[name] && (
          <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
            {fieldErrors[name]}
          </small>
        )}
      </label>
    );
  }

  function renderTextarea(label, name) {
    return (
      <label className="collaboration-create-field is-full-width" key={name}>
        <span>{label}</span>
        <textarea
          name={name}
          value={formData[name]}
          onChange={(event) => updateField(name, event.target.value)}
        />
      </label>
    );
  }

  return (
    <AdminLayout pageClass="collaborations-admin collaboration-create-admin collaboration-edit-admin">
      <main className="dashboard-main collaborations-main collaboration-create-main">
        <header className="collaborations-header collaboration-create-header">
          <h1>
            <span aria-hidden="true">🤝</span>
            Edit Brand Deal
          </h1>
          <Link className="collaboration-create-back" to="/admin/collaborations">
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card collaboration-create-card"
          aria-label="Edit Brand Deal"
        >
          {loading ? (
            <p className="collaboration-edit-message" role="status">Loading Brand Deal...</p>
          ) : error && !formData.brand_name ? (
            <p className="collaboration-edit-error" role="alert">{error}</p>
          ) : (
            <form className="collaboration-create-form" onSubmit={handleSubmit}>
              {error && <p className="collaboration-edit-error" role="alert">{error}</p>}
              <div className="collaboration-create-section">
                <h2 className="collaboration-create-section-title">Brand &amp; Contact Information</h2>
                <div className="collaboration-create-fields">
                  {renderInput("Name", "name")}
                  {renderInput("Organization Name", "organization_name")}
                  {renderInput("Brand Name", "brand_name", "text", true)}
                  {renderInput("Contact Person", "contact_person", "text", true)}
                  {renderInput("Email", "email", "email", true)}
                  {renderInput("Phone Number", "phone_number", "tel")}
                  {renderInput("Instagram / Website", "instagram_or_website", "text")}
                  {renderInput("Collaboration Type", "collaboration_type")}
                </div>
              </div>

              <div className="collaboration-create-section is-promotion">
                <h2 className="collaboration-create-section-title">Promotion Details</h2>
                <div className="collaboration-create-fields">
                  {renderInput("Type of Promotion", "type_of_promotion")}
                  {renderInput("Budget Range", "budget_range")}
                  <label className="collaboration-create-field">
                    <span>Review Status</span>
                    <select
                      name="review_status"
                      value={formData.review_status}
                      onChange={(event) => updateField("review_status", event.target.value)}
                    >
                      <option value="0">Pending</option>
                      <option value="1">Reviewed</option>
                      <option value="2">Rejected</option>
                    </select>
                  </label>
                  {renderTextarea("Campaign Goal", "campaign_goal")}
                  {renderTextarea("Message", "message")}
                </div>
              </div>

              <label className="collaboration-create-commercial">
                <input
                  type="checkbox"
                  checked={formData.commercial_inquiry}
                  onChange={(event) => updateField("commercial_inquiry", event.target.checked)}
                />
                <span>Commercial Inquiry</span>
              </label>

              <div className="collaboration-create-actions">
                <Link className="talent-show-button talent-show-button-inactive" to="/admin/collaborations">
                  Cancel
                </Link>
                <button className="talent-show-button talent-show-button-add" type="submit" disabled={saving}>
                  {saving ? "Updating..." : "Update Brand Deal"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}

export default CollaborationEditAdmin;
