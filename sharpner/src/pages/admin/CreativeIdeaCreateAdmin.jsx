import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { ideasApi } from '../../services/ideasApi.js'
import { 
  isValidEmail, 
  getEmailErrorMessage
} from '../../utils/validation'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CreativeIdeasAdmin.css'
import '../../styles/pages/CreativeIdeaCreateAdmin.css'

function CreativeIdeaCreateAdmin() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [email, setEmail] = useState('')

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const permission = formData.get('permission')
    const emailValue = String(formData.get('email') ?? '').trim()

    // Validate email if provided (optional field)
    const validationErrors = {}
    
    if (emailValue) {
      const emailError = getEmailErrorMessage(emailValue, false)
      if (emailError) {
        validationErrors.email = emailError
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
      await ideasApi.createIdea({
        name: String(formData.get('name') ?? '').trim(),
        instagram: String(formData.get('instagramUsername') ?? '').trim() || null,
        email: emailValue || null,
        reel_idea: String(formData.get('creativeIdea') ?? '').trim(),
        hook_line: String(formData.get('suggestedHook') ?? '').trim(),
        viral_reason: String(formData.get('whyItWillWork') ?? '').trim(),
        credit_permission: permission === 'yes',
      })
      window.alert('Creative idea saved successfully.')
      navigate('/admin/ideas')
    } catch (requestError) {
      console.error('Failed to save creative idea:', requestError)
      setError(requestError.message || 'Unable to save this idea.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout pageClass="creative-ideas-admin">
      <main className="dashboard-main creative-ideas-main creative-idea-create-main">
        <header className="creative-ideas-header creative-idea-create-header">
          <h1>
            <span aria-hidden="true">💡</span>
            Add New Creative Idea
          </h1>
          <Link
            className="creative-idea-create-back"
            to="/admin/ideas"
          >
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card creative-ideas-card creative-idea-create-card"
          aria-labelledby="creative-idea-create-title"
        >
          <h2 id="creative-idea-create-title">Idea Details</h2>
          <form
            className="creative-idea-create-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <p className="creative-idea-edit-error" role="alert">
                {error}
              </p>
            )}
            <label className="creative-idea-create-field">
              <span>Name *</span>
              <input name="name" type="text" required />
            </label>

            <label className="creative-idea-create-field">
              <span>Instagram Username</span>
              <input
                name="instagramUsername"
                type="text"
                placeholder="@username"
              />
            </label>

            <label className="creative-idea-create-field">
              <span>Email</span>
              <input 
                name="email" 
                type="email"
                value={email}
                onChange={handleEmailChange}
              />
              {fieldErrors.email && (
                <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.email}
                </small>
              )}
            </label>

            <label className="creative-idea-create-field">
              <span>Review Status</span>
              <input name="reviewStatus" type="text" value="Pending" readOnly />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Your Creative Idea *</span>
              <textarea name="creativeIdea" required />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Suggested Hook *</span>
              <input name="suggestedHook" type="text" required />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Why will this work? *</span>
              <textarea name="whyItWillWork" required />
            </label>

            <fieldset className="creative-idea-create-permission">
              <legend>Can SHARPNER use this idea? *</legend>
              <label>
                <input name="permission" type="radio" value="yes" required />
                <span>Yes</span>
              </label>
              <label>
                <input name="permission" type="radio" value="no" required />
                <span>No</span>
              </label>
            </fieldset>

            <div className="creative-idea-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/ideas"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Idea'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default CreativeIdeaCreateAdmin
