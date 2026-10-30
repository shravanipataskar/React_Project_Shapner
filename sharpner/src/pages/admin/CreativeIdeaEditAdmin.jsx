import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { ideasApi } from '../../services/ideasApi.js'
import { 
  isValidEmail, 
  sanitizeEmailInput,
  getEmailErrorMessage
} from '../../utils/validation'
import { useAuth } from '../../app/authContext.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CreativeIdeasAdmin.css'
import '../../styles/pages/CreativeIdeaCreateAdmin.css'

const EMPTY_FORM = {
  name: '',
  instagram: '',
  email: '',
  review_status: '',
  reel_idea: '',
  hook_line: '',
  viral_reason: '',
  credit_permission: null,
}

function getIdeaData(result) {
  return result?.data ?? result
}

function CreativeIdeaEditAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Redirect admin users (user_type "11" or 11) - only super admin can edit
  useEffect(() => {
    if (user?.user_type === "11" || user?.user_type === 11) {
      navigate('/admin/ideas', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    let active = true

    async function loadIdea() {
      setLoading(true)
      setError('')

      try {
        const result = await ideasApi.getIdea(id)
        const idea = getIdeaData(result)

        if (result?.success === false || !idea?.id) {
          throw new Error(result?.message || 'Creative idea not found.')
        }

        if (active) {
          setFormData({
            name: idea.name ?? '',
            instagram: idea.instagram ?? '',
            email: idea.email ?? '',
            review_status:
              idea.review_status === null || idea.review_status === undefined
                ? ''
                : String(idea.review_status),
            reel_idea: idea.reel_idea ?? '',
            hook_line: idea.hook_line ?? '',
            viral_reason: idea.viral_reason ?? '',
            credit_permission:
              idea.credit_permission === null ||
              idea.credit_permission === undefined
                ? null
                : Boolean(idea.credit_permission),
          })
        }
      } catch (requestError) {
        if (active) {
          console.error('Failed to load creative idea:', requestError)
          setError(requestError.message || 'Unable to load this creative idea.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadIdea()

    return () => {
      active = false
    }
  }, [id])

  function updateField(field, value) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }))
    setError('')
    
    // Clear field error when user edits
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: '',
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.reel_idea.trim() ||
      !formData.hook_line.trim() ||
      !formData.viral_reason.trim() ||
      formData.review_status === '' ||
      formData.credit_permission === null
    ) {
      setError('Complete all required fields before updating this idea.')
      return
    }

    // Validate email if provided (optional field)
    const validationErrors = {}
    
    if (formData.email && formData.email.trim()) {
      const emailError = getEmailErrorMessage(formData.email, false)
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
      await ideasApi.updateIdea(id, {
        name: formData.name.trim(),
        instagram: formData.instagram.trim() || null,
        email: formData.email.trim() || null,
        review_status: Number(formData.review_status),
        reel_idea: formData.reel_idea.trim(),
        hook_line: formData.hook_line.trim(),
        viral_reason: formData.viral_reason.trim(),
        credit_permission: formData.credit_permission,
      })
      navigate('/admin/ideas')
    } catch (requestError) {
      console.error('Failed to update creative idea:', requestError)
      setError(requestError.message || 'Unable to update this creative idea.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout pageClass="creative-ideas-admin creative-idea-edit-admin">
      <main className="dashboard-main creative-ideas-main creative-idea-create-main">
        <header className="creative-ideas-header creative-idea-create-header">
          <h1>
            <span aria-hidden="true">💡</span>
            Edit Creative Idea
          </h1>
          <Link className="creative-idea-create-back" to="/admin/ideas">
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card creative-ideas-card creative-idea-create-card"
          aria-labelledby="creative-idea-edit-title"
        >
          <h2 id="creative-idea-edit-title">Idea Details</h2>
          {error && (
            <p className="creative-idea-edit-error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p className="creative-idea-edit-message" role="status">
              Loading creative idea...
            </p>
          ) : !error || formData.name ? (
            <form
              className="creative-idea-create-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <label className="creative-idea-create-field">
                <span>Name *</span>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  required
                />
              </label>

              <label className="creative-idea-create-field">
                <span>Instagram Username</span>
                <input
                  name="instagram"
                  type="text"
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={(event) =>
                    updateField('instagram', event.target.value)
                  }
                />
              </label>

              <label className="creative-idea-create-field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
                {fieldErrors.email && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {fieldErrors.email}
                  </small>
                )}
              </label>

              <label className="creative-idea-create-field">
                <span>Review Status</span>
                <select
                  name="review_status"
                  value={formData.review_status}
                  onChange={(event) =>
                    updateField('review_status', event.target.value)
                  }
                  required
                >
                  <option value="">Select review status</option>
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Rejected</option>
                </select>
              </label>

              <label className="creative-idea-create-field is-full-width">
                <span>Your Creative Idea *</span>
                <textarea
                  name="reel_idea"
                  value={formData.reel_idea}
                  onChange={(event) =>
                    updateField('reel_idea', event.target.value)
                  }
                  required
                />
              </label>

              <label className="creative-idea-create-field is-full-width">
                <span>Suggested Hook *</span>
                <input
                  name="hook_line"
                  type="text"
                  value={formData.hook_line}
                  onChange={(event) =>
                    updateField('hook_line', event.target.value)
                  }
                  required
                />
              </label>

              <label className="creative-idea-create-field is-full-width">
                <span>Why will this work? *</span>
                <textarea
                  name="viral_reason"
                  value={formData.viral_reason}
                  onChange={(event) =>
                    updateField('viral_reason', event.target.value)
                  }
                  required
                />
              </label>

              <fieldset className="creative-idea-create-permission">
                <legend>Can SHARPNER use this idea? *</legend>
                <label>
                  <input
                    name="credit_permission"
                    type="radio"
                    value="yes"
                    checked={formData.credit_permission === true}
                    onChange={() => updateField('credit_permission', true)}
                    required
                  />
                  <span>Yes</span>
                </label>
                <label>
                  <input
                    name="credit_permission"
                    type="radio"
                    value="no"
                    checked={formData.credit_permission === false}
                    onChange={() => updateField('credit_permission', false)}
                    required
                  />
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
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </main>
    </AdminLayout>
  )
}

export default CreativeIdeaEditAdmin
