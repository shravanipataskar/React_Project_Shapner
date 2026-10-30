import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { usersApi } from '../../services/api.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/UsersAdmin.css'

function UsersAdmin() {
  const location = useLocation()
  const { pathname } = location
  const notice = location.state?.notice

  const statusFilter = pathname.endsWith('/inactive')
    ? 'inactive'
    : 'active'

  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      try {
        setLoading(true)
        setError('')
        const result = await usersApi.getAll()

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch users')
        }

        if (!cancelled) {
          setUsers(Array.isArray(result.data) ? result.data : [])
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)

        if (!cancelled) {
          setError('Unable to load users. Please try again later.')
          setUsers([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [])

  const visibleUsers = useMemo(() => {
    const query = statusFilter === 'active' ? search.toLowerCase() : ''

    return users.filter((user) => {
      const active = Number(user.status) === 1

      const matchesActive =
        active === (statusFilter === 'active')

      const matchesQuery =
        !query ||
        [
          user.name,
          user.username,
          user.email,
          user.phone_number,
          user.whatsapp_number,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query),
        )

      return matchesActive && matchesQuery
    })
  }, [users, search, statusFilter])

  function submitSearch(event) {
    event.preventDefault()
    setSearch(searchText.trim().toLowerCase())
  }

  function resetFilters() {
    setSearchText('')
    setSearch('')
  }

  async function changeUserStatus(user, nextStatus) {
    const action = nextStatus ? 'activate' : 'deactivate'
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`,
    )

    if (!confirmed) return

    try {
      setError('')
      setUpdatingUserId(user.id)
      await usersApi.updateStatus(user.id, nextStatus)
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? { ...currentUser, status: nextStatus ? 1 : 0 }
            : currentUser,
        ),
      )
    } catch (err) {
      console.error(`Failed to ${action} user:`, err)
      setError(`Unable to ${action} this user. Please try again.`)
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <AdminLayout
      pageClass={`users-admin${
        statusFilter === 'inactive' ? ' is-inactive' : ''
      }`}
    >
      <main className="dashboard-main users-main">
        <header className="users-header">
          <h1>
            <span
              className={
                statusFilter === 'inactive' ? 'users-inactive-icon' : ''
              }
              aria-hidden="true"
            >
              {statusFilter === 'inactive' ? '⏸️' : '👥'}
            </span>
            {statusFilter === 'inactive'
              ? 'Inactive Users'
              : 'Manage Users'}
          </h1>

          <div
            className="users-toolbar"
            aria-label="User actions"
          >
            <Link
              className={`talent-show-button talent-show-button-active${
                statusFilter === 'active' ? ' is-selected' : ''
              }`}
              to="/admin/users"
              aria-current={
                statusFilter === 'active' ? 'page' : undefined
              }
            >
              ✅ Active
            </Link>

            <Link
              className={`talent-show-button talent-show-button-inactive${
                statusFilter === 'inactive' ? ' is-selected' : ''
              }`}
              to="/admin/users/inactive"
              aria-current={
                statusFilter === 'inactive' ? 'page' : undefined
              }
            >
              ⏸ Inactive
            </Link>

            <Link
              className="talent-show-button talent-show-button-add"
              to="/admin/users/create"
            >
              ➕ Add New
            </Link>
          </div>
        </header>

        <section
          className="talent-show-card users-card"
          aria-label="Users"
        >
          {notice && (
            <p className="users-feedback" role="status">
              {notice}
            </p>
          )}

          {statusFilter === 'active' && (
            <form
              className="talent-show-search users-search"
              onSubmit={submitSearch}
              role="search"
            >
              <label
                className="talent-show-sr-only"
                htmlFor="users-search"
              >
                Search by name
              </label>

              <input
                id="users-search"
                type="search"
                placeholder="Search by Name..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
              />

              <button
                type="submit"
                className="talent-show-button talent-show-button-search"
              >
                🔍 Search
              </button>

              <button
                type="button"
                className="talent-show-button talent-show-button-reset"
                onClick={resetFilters}
              >
                ✕ Reset
              </button>
            </form>
          )}

          <div className="talent-show-table-scroll users-table-scroll">
            <table className="talent-show-table users-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="4"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : error && users.length === 0 ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="4">
                      {error}
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="4"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>

                      <td>{user.email}</td>

                      <td>
                        {user.phone_number || '-'}
                      </td>

                      <td>
                        <div className="talent-show-row-actions">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="talent-show-button talent-show-button-view"
                            state={{ from: pathname }}
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="talent-show-button talent-show-button-edit"
                            state={{ from: pathname }}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className={`talent-show-button ${
                              statusFilter === 'active'
                                ? 'talent-show-button-deactivate'
                                : 'talent-show-button-activate'
                            }`}
                            onClick={() =>
                              changeUserStatus(
                                user,
                                statusFilter === 'inactive',
                              )
                            }
                            disabled={updatingUserId === user.id}
                          >
                            {updatingUserId === user.id
                              ? 'Updating...'
                              : statusFilter === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {statusFilter === 'active' && (
            <div className="users-bottom-bar" aria-hidden="true" />
          )}
          {error && users.length > 0 && (
              <p className="users-feedback" role="alert">
                {error}
              </p>
          )}
        </section>
      </main>
    </AdminLayout>
  )
}

export default UsersAdmin
