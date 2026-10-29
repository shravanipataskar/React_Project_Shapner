import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { usersApi } from '../../services/api.js'
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
  return String(value ?? '') === '00' ? 'Super Admin' : String(value ?? '')
}

function UserEditPage() {
  const { id } = useParams()
  const location = useLocation()
  const returnPath =
    location.state?.from === '/admin/users/inactive'
      ? '/admin/users/inactive'
      : '/admin/users'
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')

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
    setFormData((previous) => ({ ...previous, [name]: value }))
    setSaveError('')
  }

  function handleSubmit(event) {
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

    setSaveError(
      'Saving changes is unavailable until admin authentication is connected.',
    )
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
              />
            </div>

            <div className="user-create-field">
              <label htmlFor="edit-user-whatsapp">WhatsApp Number</label>
              <input
                id="edit-user-whatsapp"
                name="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={updateField}
              />
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
              >
                <span aria-hidden="true">⚡</span>
                Update User
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
