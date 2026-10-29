import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/UsersAdmin.css'

function UsersAdmin() {
  const { pathname } = useLocation()
  const statusFilter = pathname.endsWith('/inactive') ? 'inactive' : 'active'
  const [users] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')

  const visibleUsers = useMemo(() => {
    const query = search.toLowerCase()

    return users.filter((user) => {
      const active = user.active !== false
      const matchesStatus = active === (statusFilter === 'active')
      const matchesSearch = [user.name, user.email, user.phone].some((value) =>
        String(value ?? '').toLowerCase().includes(query),
      )

      return matchesStatus && matchesSearch
    })
  }, [users, search, statusFilter])

  function submitSearch(event) {
    event.preventDefault()
    setSearch(searchText.trim().toLowerCase())
  }

  function resetSearch() {
    setSearchText('')
    setSearch('')
  }

  return (
    <AdminLayout
      pageClass={`users-admin${statusFilter === 'inactive' ? ' is-inactive' : ''}`}
    >
      <main className="dashboard-main users-main">
        <header className="users-header">
          <h1>
            <span aria-hidden="true">
              {statusFilter === 'inactive' ? '⏸️' : '👥'}
            </span>
            {statusFilter === 'inactive' ? 'Inactive Users' : 'Manage Users'}
          </h1>
          <div className="users-toolbar" aria-label="User actions">
            <Link
              className={`talent-show-button talent-show-button-active${statusFilter === 'active' ? ' is-selected' : ''}`}
              to="/admin/users"
              aria-current={statusFilter === 'active' ? 'page' : undefined}
            >
              ✅ Active
            </Link>
            <Link
              className={`talent-show-button talent-show-button-inactive${statusFilter === 'inactive' ? ' is-selected' : ''}`}
              to="/admin/users/inactive"
              aria-current={statusFilter === 'inactive' ? 'page' : undefined}
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

        <section className="talent-show-card users-card" aria-label="Users">
          {statusFilter === 'active' && <form
            className="talent-show-search users-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label className="talent-show-sr-only" htmlFor="users-search">
              Search users by name
            </label>
            <input
              id="users-search"
              type="search"
              placeholder="Search by Name..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
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
              onClick={resetSearch}
            >
              ✕ Reset
            </button>
          </form>}

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
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="4">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <div className="talent-show-row-actions">
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-view"
                            disabled
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-edit"
                            disabled
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-deactivate"
                            disabled
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="users-bottom-bar" aria-hidden="true" />
        </section>
      </main>
    </AdminLayout>
  )
}

export default UsersAdmin
