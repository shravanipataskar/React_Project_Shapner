import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { usersApi } from '../../services/api.js'
import { getUserTypeLabel, getUserTypeValue } from '../../utils/userTypes.js'
import { 
  sanitizePhoneInput,
  getPhoneErrorMessage,
  getEmailErrorMessage
} from '../../utils/validation'
import '../../styles/pages/UserCreatePage.css'

const initialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone_number: '',
  whatsapp_number: '',
  user_type: '',
  status: '1',
}

function displayUserType(value) {
  return getUserTypeLabel(value)
}

function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath =
    location.state?.from === '/admin/users/inactive'
      ? '/admin/users/inactive'
      : '/admin/users'
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      try {
        setLoading(true)
        setLoadError('')
        const result = await usersApi.getById(id)
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to load user')
        }

        const user = result.data
        if (!cancelled) {
          setFormData({
            name: user.name ?? '',
            username: user.username ?? '',
            email: user.email ?? '',
            password: '',
            password_confirmation: '',
            phone_number: user.phone_number ?? '',
            whatsapp_number: user.whatsapp_number ?? '',
            user_type: displayUserType(user.user_type),
            status: String(Number(user.status) === 1 ? 1 : 0),
          })
        }
      } catch (error) {
        console.error('Failed to load user for editing:', error)
        if (!cancelled) {
          setLoadError(
            error.status === 404
              ? 'This user could not be found.'
              : 'Unable to load this user. Please try again.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [id])

  function updateField(event) {
    const { name, value } = event.target
    
    // Sanitize phone fields to allow only numeric input
    let cleanedValue = value
    if (name === 'phone_number' || name === 'whatsapp_number') {
      cleanedValue = sanitizePhoneInput(value)
      if (cleanedValue.length > 10) {
        cleanedValue = cleanedValue.slice(0, 10)
      }
    }
    
    setFormData((previous) => ({ ...previous, [name]: cleanedValue }))
    setSaveError('')
    
    // Clear field error when user edits
    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: '',
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      setSaveError('The new password and confirmation do not match.')
      return
    }

    // Validate phone numbers and email
    const validationErrors = {}
    
    const emailError = getEmailErrorMessage(formData.email, true)
    if (emailError) {
      validationErrors.email = emailError
    }
    
    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneError = getPhoneErrorMessage(formData.phone_number, false)
      if (phoneError) {
        validationErrors.phone_number = phoneError
      }
    }
    
    if (formData.whatsapp_number && formData.whatsapp_number.trim()) {
      const whatsappError = getPhoneErrorMessage(formData.whatsapp_number, false)
      if (whatsappError) {
        validationErrors.whatsapp_number = whatsappError
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSaveError('Please fix validation errors before submitting.')
      return
    }

    const user = {
      ...formData,
      username: formData.username.trim() || null,
      user_type: getUserTypeValue(formData.user_type),
      status: Number(formData.status),
    }

    if (!user.password) {
      delete user.password
      delete user.password_confirmation
    }

    setSaving(true)
    setSaveError('')
    setFieldErrors({})

    try {
      await usersApi.update(id, user)
      navigate(returnPath, {
        replace: true,
        state: { notice: 'User updated successfully.' },
      })
    } catch (error) {
      console.error('Failed to update user:', error)
      setSaveError(
        error.status === 422
          ? error.message
          : 'Unable to update this user. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout pageClass="user-create">
      <main className="dashboard-main user-create-main">
        <header className="user-create-header">
          <h1>
            <span aria-hidden="true">✏️</span>
            Edit User
          </h1>
        </header>

        {loading ? (
          <section className="user-create-card" role="status">
            Loading user...
          </section>
        ) : loadError ? (
          <section className="user-create-card" role="alert">
            <p className="user-edit-message">{loadError}</p>
            <Link className="user-create-cancel" to={returnPath}>
              Cancel
            </Link>
          </section>
        ) : (
          <form className="user-create-card" onSubmit={handleSubmit}>
            <div className="user-create-field">
              <label htmlFor="edit-user-name">Name</label>
              <input
                id="edit-user-name"
                name="name"
                value={formData.name}
                onChange={updateField}
                autoComplete="name"
                required
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-username">Username</label>
              <input
                id="edit-user-username"
                name="username"
                value={formData.username}
                onChange={updateField}
                autoComplete="username"
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-email">Email</label>
              <input
                id="edit-user-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={updateField}
                autoComplete="email"
                required
              />
              {fieldErrors.email && (
                <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.email}
                </small>
              )}
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-password">
                New Password (leave blank to keep current)
              </label>
              <input
                id="edit-user-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={updateField}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-password-confirmation">
                Confirm New Password
              </label>
              <input
                id="edit-user-password-confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={updateField}
                autoComplete="new-password"
                minLength={formData.password ? 8 : undefined}
                required={Boolean(formData.password)}
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-phone">Phone Number</label>
              <input
                id="edit-user-phone"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={updateField}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
              />
              {fieldErrors.phone_number && (
                <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.phone_number}
                </small>
              )}
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-whatsapp">WhatsApp Number</label>
              <input
                id="edit-user-whatsapp"
                name="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={updateField}
                inputMode="numeric"
                maxLength={10}
              />
              {fieldErrors.whatsapp_number && (
                <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.whatsapp_number}
                </small>
              )}
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-type">User Type</label>
              <input
                id="edit-user-type"
                name="user_type"
                value={formData.user_type}
                onChange={updateField}
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-status">Status</label>
              <select
                id="edit-user-status"
                name="status"
                value={formData.status}
                onChange={updateField}
                required
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {saveError && (
              <p className="user-edit-message is-error" role="alert">
                {saveError}
              </p>
            )}

            <div className="user-create-actions">
              <button
                type="submit"
                className="user-create-save"
                disabled={saving}
              >
                <span aria-hidden="true">⚡</span>
                {saving ? 'Saving...' : 'Update User'}
              </button>
              <Link className="user-create-cancel" to={returnPath}>
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </AdminLayout>
  )
}

export default UserEditPage
