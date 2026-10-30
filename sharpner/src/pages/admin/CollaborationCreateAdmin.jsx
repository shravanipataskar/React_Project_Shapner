import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { collaborationsApi } from '../../services/collaborationsApi.js'
import { 
  isValidPhoneNumber, 
  isValidEmail, 
  sanitizePhoneInput,
  getPhoneErrorMessage,
  getEmailErrorMessage
} from '../../utils/validation'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CollaborationsAdmin.css'
import '../../styles/pages/CollaborationCreateAdmin.css'

function CollaborationCreateAdmin() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    
    let cleanedValue = value
    if (name === 'phoneNumber') {
      cleanedValue = sanitizePhoneInput(value)
      if (cleanedValue.length > 10) {
        cleanedValue = cleanedValue.slice(0, 10)
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: cleanedValue }))
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formDataObj = new FormData(event.currentTarget)

    // Validate phone and email
    const validationErrors = {}
    
    const emailValue = String(formDataObj.get('email') ?? '').trim()
    const emailError = getEmailErrorMessage(emailValue, true)
    if (emailError) {
      validationErrors.email = emailError
    }
    
    const phoneValue = String(formDataObj.get('phoneNumber') ?? '').trim()
    if (phoneValue) {
      const phoneError = getPhoneErrorMessage(phoneValue, false)
      if (phoneError) {
        validationErrors.phoneNumber = phoneError
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError('Please fix validation errors before submitting.')
      return
    }

    setSaving(true)
    setError('')
    setFieldErrors({})
    try {
      await collaborationsApi.createAdmin({
        name: String(formDataObj.get('name') ?? '').trim() || null,
        organization_name:
          String(formDataObj.get('organizationName') ?? '').trim() || null,
        brand_name: String(formDataObj.get('brandName') ?? '').trim(),
        contact_person: String(formDataObj.get('contactPerson') ?? '').trim(),
        collaboration_type: 'brand',
        email: emailValue,
        phone_number: phoneValue || null,
        instagram_or_website:
          String(formDataObj.get('website') ?? '').trim() || null,
        type_of_promotion: String(formDataObj.get('promotionType') ?? ''),
        budget_range: String(formDataObj.get('budgetRange') ?? ''),
        campaign_goal: String(formDataObj.get('campaignGoal') ?? '').trim(),
        message: String(formDataObj.get('additionalMessage') ?? '').trim(),
        commercial_inquiry: formDataObj.has('commercialInquiry'),
        review_status: Number(formDataObj.get('reviewStatus')),
      })
      window.alert('Brand Deal saved successfully.')
      navigate('/admin/collaborations')
    } catch (requestError) {
      console.error('Failed to save Brand Deal:', requestError)
      setError(requestError.message || 'Unable to save this Brand Deal.')
    } finally {
      setSaving(false)
    }
  }

  const promotionTypes = [
    ['sponsored_video', 'Sponsored Video'],
    ['product_placement', 'Product Placement'],
    ['event_sponsorship', 'Event Sponsorship'],
    ['creative_campaign', 'Creative Campaign'],
    ['other', 'Other'],
  ]
  const budgetRanges = [
    ['10k-50k', '₹10K - ₹50K'],
    ['50k-1L', '₹50K - ₹1 Lakh'],
    ['1L-5L', '₹1 Lakh - ₹5 Lakhs'],
    ['5L+', '₹5 Lakhs+'],
  ]

  return (
    <AdminLayout pageClass="collaborations-admin collaboration-create-admin">
      <main className="dashboard-main collaborations-main collaboration-create-main">
        <header className="collaborations-header collaboration-create-header">
          <h1>
            <span aria-hidden="true">🤝</span>
            Add New Brand Deal
          </h1>
          <Link
            className="collaboration-create-back"
            to="/admin/collaborations"
          >
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card collaboration-create-card"
          aria-label="Add new brand deal"
        >
          <form
            className="collaboration-create-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <p className="talent-show-data-message is-error" role="alert">
                {error}
              </p>
            )}
            <div className="collaboration-create-section">
              <h2 className="collaboration-create-section-title">
                Brand &amp; Contact Information
              </h2>
              <div className="collaboration-create-fields">
                <label className="collaboration-create-field">
                  <span>Name</span>
                  <input name="name" type="text" />
                </label>

                <label className="collaboration-create-field">
                  <span>Organization Name</span>
                  <input name="organizationName" type="text" />
                </label>

                <label className="collaboration-create-field">
                  <span>Brand Name *</span>
                  <input name="brandName" type="text" required />
                </label>

                <label className="collaboration-create-field">
                  <span>Contact Person *</span>
                  <input name="contactPerson" type="text" required />
                </label>

                <label className="collaboration-create-field">
                  <span>Email *</span>
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                  {fieldErrors.email && (
                    <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {fieldErrors.email}
                    </small>
                  )}
                </label>

                <label className="collaboration-create-field">
                  <span>Phone Number</span>
                  <input 
                    name="phoneNumber" 
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {fieldErrors.phoneNumber && (
                    <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {fieldErrors.phoneNumber}
                    </small>
                  )}
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Instagram / Website</span>
                  <input name="website" type="url" />
                </label>
              </div>
            </div>

            <div className="collaboration-create-section is-promotion">
              <h2 className="collaboration-create-section-title">
                Promotion Details
              </h2>
              <div className="collaboration-create-fields">
                <label className="collaboration-create-field">
                  <span>Collaboration Type</span>
                  <select name="collaborationType" defaultValue="brand">
                    <option value="brand">Brand</option>
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Type of Promotion *</span>
                  <select name="promotionType" defaultValue="" required>
                    <option value="" disabled>
                      Select type of promotion
                    </option>
                    {promotionTypes.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Budget Range *</span>
                  <select name="budgetRange" defaultValue="" required>
                    <option value="" disabled>
                      Select budget range
                    </option>
                    {budgetRanges.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Review Status</span>
                  <select name="reviewStatus" defaultValue="0">
                    <option value="0">Pending</option>
                    <option value="1">Reviewed</option>
                    <option value="2">Rejected</option>
                  </select>
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Campaign Goal *</span>
                  <textarea name="campaignGoal" required />
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Additional Message *</span>
                  <textarea name="additionalMessage" required />
                </label>
              </div>
            </div>

            <label className="collaboration-create-commercial">
              <input name="commercialInquiry" type="checkbox" />
              <span>Commercial Inquiry</span>
            </label>

            <div className="collaboration-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/collaborations"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Brand Deal'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default CollaborationCreateAdmin
