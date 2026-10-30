import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { usersApi } from '../../services/api.js'
import '../../styles/pages/UserCreatePage.css'

const userFields = [
  { id: 'name', label: 'Name', placeholder: 'Full Name', required: true },
  { id: 'username', label: 'Username' },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    required: true,
  },
  { id: 'password', label: 'Password', type: 'password', required: true },
  {
    id: 'confirm-password',
    name: 'password_confirmation',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm Password',
    required: true,
  },
  {
    id: 'phone',
    name: 'phone_number',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Phone Number',
  },
  {
    id: 'whatsapp-number',
    name: 'whatsapp_number',
    label: 'WhatsApp Number',
    type: 'tel',
    placeholder: 'WhatsApp Number',
  },
]

function UserCreatePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    whatsapp_number: '',
    user_type: '',
  })
  const [userTypes, setUserTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    usersApi.getCreateOptions()
      .then((result) => {
        if (active) {
          setUserTypes(
            Array.isArray(result?.data?.user_types)
              ? result.data.user_types.map(String)
              : [],
          )
        }
      })
      .catch((requestError) => {
        console.error('Failed to load user types:', requestError)
        if (active) {
          setError('Unable to load user types. Please retry the page.')
        }
      })
      .finally(() => {
        if (active) setLoadingTypes(false)
      })

    return () => {
      active = false
    }
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Password and confirmation do not match.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await usersApi.create({
        name: formData.name.trim(),
        username: formData.username.trim() || null,
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone_number: formData.phone_number.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim() || null,
        user_type: formData.user_type,
      })
      window.alert('User saved successfully.')
      navigate('/admin/users')
    } catch (requestError) {
      console.error('Failed to save user:', requestError)
      setError(requestError.message || 'Unable to save this user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout pageClass="user-create">
      <main className="dashboard-main user-create-main">
        <header className="user-create-header">
          <h1>
            <span aria-hidden="true">➕</span>
            Add New User
          </h1>
        </header>

        <form className="user-create-card" onSubmit={handleSubmit}>
          {error && (
            <p className="user-edit-message is-error" role="alert">
              {error}
            </p>
          )}
          {userFields.map(({ id, name, label, type = 'text', placeholder, required }) => (
            <div className="user-create-field" key={id}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                name={name ?? id}
                type={type}
                placeholder={placeholder}
                value={formData[name ?? id]}
                onChange={updateField}
                required={required}
              />
            </div>
          ))}

          <div className="user-create-field">
            <label htmlFor="user-type">User Type</label>
            <select
              id="user-type"
              name="user_type"
              value={formData.user_type}
              onChange={updateField}
              required
              disabled={loadingTypes || userTypes.length === 0}
            >
              <option value="">
                {loadingTypes
                  ? 'Loading user types...'
                  : userTypes.length
                    ? 'Select User Type'
                    : 'No user types available'}
              </option>
              {userTypes.map((type) => (
                <option key={type} value={type}>
                  {type === '00' ? 'Super Admin' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="user-create-actions">
            <button
              type="submit"
              className="user-create-save"
              disabled={saving || loadingTypes || userTypes.length === 0}
            >
              <span aria-hidden="true">⚡</span>
              {saving ? 'Saving...' : 'Save User'}
            </button>
            <Link className="user-create-cancel" to="/admin/users">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </AdminLayout>
  )
}

export default UserCreatePage
