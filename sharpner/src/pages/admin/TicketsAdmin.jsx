import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TicketsAdmin.css'

function TicketsAdmin() {
  const { pathname } = useLocation()
  const statusFilter = pathname.endsWith('/inactive') ? 'inactive' : 'active'
  const [tickets] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [overallStatusFilter, setOverallStatusFilter] = useState('')

  const visibleTickets = useMemo(() => {
    const query = search.toLowerCase()

    return tickets.filter((ticket) => {
      const active = ticket.active !== false
      const matchesActive = active === (statusFilter === 'active')
      const matchesQuery = [ticket.ticketNo, ticket.subject].some((value) =>
        String(value ?? '').toLowerCase().includes(query),
      )
      const matchesModule =
        !moduleFilter || ticket.module === moduleFilter
      const matchesOverallStatus =
        !overallStatusFilter || ticket.status === overallStatusFilter

      return (
        matchesActive &&
        matchesQuery &&
        matchesModule &&
        matchesOverallStatus
      )
    })
  }, [tickets, search, statusFilter, moduleFilter, overallStatusFilter])

  function submitSearch(event) {
    event.preventDefault()
    setSearch(searchText.trim().toLowerCase())
  }

  function resetFilters() {
    setSearchText('')
    setSearch('')
    setModuleFilter('')
    setOverallStatusFilter('')
  }

  return (
    <AdminLayout
      pageClass={`tickets-admin${statusFilter === 'inactive' ? ' is-inactive' : ''}`}
    >
      <main className="dashboard-main tickets-main">
        <header className="tickets-header">
          <h1>
            <span aria-hidden="true">
              🎫
            </span>
            {statusFilter === 'inactive' ? 'Inactive Tickets' : 'Manage Tickets'}
          </h1>
          <div className="tickets-toolbar" aria-label="Ticket actions">
            <Link
              className={`talent-show-button talent-show-button-active${statusFilter === 'active' ? ' is-selected' : ''}`}
              to="/admin/tickets"
              aria-current={statusFilter === 'active' ? 'page' : undefined}
            >
              ✅ Active
            </Link>
            <Link
              className={`talent-show-button talent-show-button-inactive${statusFilter === 'inactive' ? ' is-selected' : ''}`}
              to="/admin/tickets/inactive"
              aria-current={statusFilter === 'inactive' ? 'page' : undefined}
            >
              ⏸ Inactive
            </Link>
            {statusFilter === 'active' && <Link
              className="talent-show-button talent-show-button-add"
              to="/admin/tickets/create"
            >
              ➕ Raise Ticket
            </Link>}
          </div>
        </header>

        <section className="talent-show-card tickets-card" aria-label="Tickets">
          <form
            className="talent-show-search tickets-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label className="talent-show-sr-only" htmlFor="tickets-search">
              Search by ticket number or subject
            </label>
            <input
              id="tickets-search"
              type="search"
              placeholder="Search by ticket no, subject, module..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <label className="talent-show-sr-only" htmlFor="tickets-module">
              Filter by module
            </label>
            <select
              id="tickets-module"
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
            >
              <option value="">Select Module</option>
            </select>
            <label className="talent-show-sr-only" htmlFor="tickets-overall-status">
              Filter by overall status
            </label>
            <select
              id="tickets-overall-status"
              value={overallStatusFilter}
              onChange={(event) => setOverallStatusFilter(event.target.value)}
            >
              <option value="">Overall Status</option>
            </select>
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

          <div className="talent-show-table-scroll tickets-table-scroll">
            <table className="talent-show-table tickets-table">
              <thead>
                <tr>
                  <th scope="col">Ticket No</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Application</th>
                  <th scope="col">Module</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTickets.length === 0 ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="7">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  visibleTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.ticketNo}</td>
                      <td>{ticket.subject}</td>
                      <td>{ticket.application}</td>
                      <td>{ticket.module}</td>
                      <td>
                        <span className="tickets-category">
                          {ticket.category}
                        </span>
                      </td>
                      <td>
                        <span className="tickets-status">{ticket.status}</span>
                      </td>
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
        </section>
      </main>
    </AdminLayout>
  )
}

export default TicketsAdmin
