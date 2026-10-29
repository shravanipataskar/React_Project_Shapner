import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'

function UsersAdmin() {
  const { pathname } = useLocation()

  const statusFilter = pathname.endsWith('/inactive')
    ? 'inactive'
    : 'active'

  const [users, setUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const apiUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${apiUrl}/users`)

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch users')
        }

        if (!cancelled) {
          setUsers(Array.isArray(result.data) ? result.data : [])
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)

        if (!cancelled) {
          setError(err.message || 'Failed to load users')
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
  }, [apiUrl])

  const visibleUsers = useMemo(() => {
    const query = search.toLowerCase()

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

  return (
    <AdminLayout
      pageClass={`users-admin${
        statusFilter === 'inactive' ? ' is-inactive' : ''
      }`}
    >
      <main className="dashboard-main users-main">
        <header className="tickets-header">
          <h1>
            <span aria-hidden="true">👥</span>
            {statusFilter === 'inactive'
              ? 'Inactive Users'
              : 'Manage Users'}
          </h1>

          <div
            className="tickets-toolbar"
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

            {statusFilter === 'active' && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/users/create"
              >
                ➕ Add New
              </Link>
            )}
          </div>
        </header>

        <section
          className="talent-show-card users-card"
          aria-label="Users"
        >
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
                ) : error ? (
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="4"
                    >
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
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="talent-show-button talent-show-button-edit"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminLayout>
  )
}

export default UsersAdmin
