import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { usersApi } from '../../services/api.js'
import { getUserTypeLabel } from '../../utils/userTypes.js'
import '../../styles/pages/UserDetailsAdmin.css'

const userDetailsFields = [
  [
    ['Name', 'name'],
    ['Email', 'email'],
    ['WhatsApp Number', 'whatsapp_number'],
    ['User Type', 'user_type'],
  ],
  [
    ['Username', 'username'],
    ['Phone Number', 'phone_number'],
    ['Status', 'status'],
    ['Created At', 'created_at'],
  ],
]

function formatCreatedAt(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function formatUserType(value) {
  return value ? getUserTypeLabel(value) : 'N/A'
}

function UserDetailsAdmin() {
  const { id } = useParams()
  const location = useLocation()
  const backPath =
    location.state?.from === '/admin/users/inactive'
      ? '/admin/users/inactive'
      : '/admin/users'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        setLoading(true)
        setHasError(false)
        const result = await usersApi.getById(id)

        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to fetch user')
        }

        if (!cancelled) setUser(result.data)
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        if (!cancelled) {
          setHasError(true)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <AdminLayout pageClass="users-detail">
      <main className="dashboard-main users-detail-main">
        <header className="users-detail-header">
          <h1>
            <span aria-hidden="true">👤</span>
            User Details
          </h1>
          <Link className="users-detail-back" to={backPath}>
            ← Back
          </Link>
        </header>

        <section className="users-detail-card" aria-label="User information">
          {loading ? (
            <p className="users-detail-message" role="status">
              Loading user details...
            </p>
          ) : hasError ? (
            <p className="users-detail-message" role="alert">
              Unable to load this user. Please try again later.
            </p>
          ) : (
            <div className="users-detail-columns">
              {userDetailsFields.map((column, columnIndex) => (
                <dl className="users-detail-column" key={columnIndex}>
                  {column.map(([label, key]) => {
                    let value = user?.[key]

                    if (key === 'status') {
                      const active = Number(value) === 1
                      return (
                        <div className="users-detail-field" key={key}>
                          <dt>{label}:</dt>
                          <dd>
                            <span
                              className={`users-status-badge ${
                                active ? 'is-active' : 'is-inactive'
                              }`}
                            >
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                      )
                    }

                    if (key === 'created_at') value = formatCreatedAt(value)
                    if (key === 'user_type') value = formatUserType(value)

                    return (
                      <div className="users-detail-field" key={key}>
                        <dt>{label}:</dt>
                        <dd>{value || 'N/A'}</dd>
                      </div>
                    )
                  })}
                </dl>
              ))}
            </div>
          )}
        </section>
      </main>
    </AdminLayout>
  )
}

export default UserDetailsAdmin
