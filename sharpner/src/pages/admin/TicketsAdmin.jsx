import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { ticketsApi } from '../../services/ticketsApi.js'
import { API_BASE_URL, apiFetch } from '../../services/apiClient.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TicketsAdmin.css'

function TicketsAdmin() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const statusFilter = pathname.endsWith('/inactive')
    ? 'inactive'
    : 'active'

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [overallStatusFilter, setOverallStatusFilter] = useState('')

  // ---------------------------------------------------------
  // FETCH TICKETS FROM LARAVEL
  // ---------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function fetchTickets() {
      try {
        setLoading(true)
        setError('')

        const response = await apiFetch(`${API_BASE_URL}/tickets`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch tickets. HTTP ${response.status}`,
          )
        }

        const result = await response.json()

        console.log('Tickets API response:', result)

        if (!result.success) {
          throw new Error(
            result.message || 'Failed to fetch tickets.',
          )
        }

        const apiTickets = Array.isArray(result.data)
          ? result.data
          : []

        // Convert Laravel snake_case fields
        // into the names used by this React page.
        const formattedTickets = apiTickets.map((ticket) => ({
          id: ticket.id,

          ticketNo: ticket.ticket_no,
          subject: ticket.subject,

          application: ticket.application_id,
          module: ticket.module_id,

          category: ticket.category,

          // Database field: ticket_status
          status: ticket.ticket_status,

          // Database field: status
          active: Number(ticket.status) === 1,

          description: ticket.description,
          userId: ticket.user_id,
          attachment: ticket.attachment,

          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
        }))

        if (!cancelled) {
          setTickets(formattedTickets)
        }
      } catch (err) {
        console.error('Tickets fetch error:', err)

        if (!cancelled) {
          setError(
            err?.message || 'Unable to load tickets.',
          )
          setTickets([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTickets()

    return () => {
      cancelled = true
    }
  }, [])

  // ---------------------------------------------------------
  // MODULE OPTIONS
  // ---------------------------------------------------------
  const moduleOptions = useMemo(() => {
    const modules = tickets
      .map((ticket) => ticket.module)
      .filter(
        (module) =>
          module !== null &&
          module !== undefined &&
          module !== '',
      )

    return [...new Set(modules)]
  }, [tickets])

  // ---------------------------------------------------------
  // FILTER TICKETS
  // ---------------------------------------------------------
  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const active = ticket.active !== false

      const matchesActive =
        active === (statusFilter === 'active')

      const matchesQuery =
        !query ||
        [
          ticket.ticketNo,
          ticket.subject,
          ticket.module,
          ticket.category,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query),
        )

      const matchesModule =
        !moduleFilter ||
        String(ticket.module) === String(moduleFilter)

      const matchesOverallStatus =
        !overallStatusFilter ||
        ticket.status === overallStatusFilter

      return (
        matchesActive &&
        matchesQuery &&
        matchesModule &&
        matchesOverallStatus
      )
    })
  }, [
    tickets,
    search,
    statusFilter,
    moduleFilter,
    overallStatusFilter,
  ])

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------
  function submitSearch(event) {
    event.preventDefault()

    setSearch(
      searchText.trim().toLowerCase(),
    )
  }

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------
  function resetFilters() {
    setSearchText('')
    setSearch('')
    setModuleFilter('')
    setOverallStatusFilter('')
  }

  // ---------------------------------------------------------
  // ACTIVATE / DEACTIVATE TICKET
  // ---------------------------------------------------------
  async function handleToggleStatus(ticket, nextActive) {
    const action = nextActive ? 'activate' : 'deactivate'
    const confirmMessage = nextActive
      ? `Are you sure you want to activate ticket ${ticket.ticketNo || ''}?`
      : `Are you sure you want to deactivate ticket ${ticket.ticketNo || ''}?`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setError('')
      await ticketsApi.updateStatus(ticket.id, nextActive)

      // Update state locally so ticket moves to the right tab immediately
      setTickets((prev) =>
        prev.map((item) =>
          item.id === ticket.id
            ? { ...item, active: nextActive }
            : item,
        ),
      )

      window.alert(
        nextActive
          ? 'Ticket activated successfully.'
          : 'Ticket deactivated successfully.',
      )
    } catch (err) {
      console.error(`Failed to ${action} ticket:`, err)
      window.alert(`Failed to ${action} ticket: ${err.message || 'Please try again.'}`)
    }
  }

  return (
    <AdminLayout
      pageClass={`tickets-admin${
        statusFilter === 'inactive'
          ? ' is-inactive'
          : ''
      }`}
    >
      <main className="dashboard-main tickets-main">

        {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}
        <header className="tickets-header">
          <h1>
            <span aria-hidden="true">🎫</span>

            {statusFilter === 'inactive'
              ? 'Inactive Tickets'
              : 'Manage Tickets'}
          </h1>

          <div
            className="tickets-toolbar"
            aria-label="Ticket actions"
          >
            <Link
              className={`talent-show-button talent-show-button-active${
                statusFilter === 'active'
                  ? ' is-selected'
                  : ''
              }`}
              to="/admin/tickets"
              aria-current={
                statusFilter === 'active'
                  ? 'page'
                  : undefined
              }
            >
              ✅ Active
            </Link>

            <Link
              className={`talent-show-button talent-show-button-inactive${
                statusFilter === 'inactive'
                  ? ' is-selected'
                  : ''
              }`}
              to="/admin/tickets/inactive"
              aria-current={
                statusFilter === 'inactive'
                  ? 'page'
                  : undefined
              }
            >
              ⏸ Inactive
            </Link>

            {statusFilter === 'active' && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/tickets/create"
              >
                ➕ Raise Ticket
              </Link>
            )}
          </div>
        </header>

        {/* -------------------------------------------------
            CARD
        ------------------------------------------------- */}
        <section
          className="talent-show-card tickets-card"
          aria-label="Tickets"
        >

          {/* -------------------------------------------------
              SEARCH / FILTERS
          ------------------------------------------------- */}
          <form
            className="talent-show-search tickets-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label
              className="talent-show-sr-only"
              htmlFor="tickets-search"
            >
              Search by ticket number or subject
            </label>

            <input
              id="tickets-search"
              type="search"
              placeholder="Search by ticket no, subject, module..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            <label
              className="talent-show-sr-only"
              htmlFor="tickets-module"
            >
              Filter by module
            </label>

            <select
              id="tickets-module"
              value={moduleFilter}
              onChange={(event) =>
                setModuleFilter(event.target.value)
              }
            >
              <option value="">
                Select Module
              </option>

              {moduleOptions.map((moduleId) => (
                <option
                  key={moduleId}
                  value={moduleId}
                >
                  Module {moduleId}
                </option>
              ))}
            </select>

            <label
              className="talent-show-sr-only"
              htmlFor="tickets-overall-status"
            >
              Filter by overall status
            </label>

            <select
              id="tickets-overall-status"
              value={overallStatusFilter}
              onChange={(event) =>
                setOverallStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Overall Status
              </option>

              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Closed">
                Closed
              </option>
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

          {/* -------------------------------------------------
              ERROR
          ------------------------------------------------- */}
          {error && (
            <div
              style={{
                padding: '15px',
                marginBottom: '15px',
                color: '#b00020',
                background: '#ffe5e5',
                borderRadius: '8px',
              }}
            >
              {error}
            </div>
          )}

          {/* -------------------------------------------------
              TABLE
          ------------------------------------------------- */}
          <div className="talent-show-table-scroll tickets-table-scroll">
            <table className="talent-show-table tickets-table">

              <thead>
                <tr>
                  <th scope="col">
                    Ticket No
                  </th>

                  <th scope="col">
                    Subject
                  </th>

                  <th scope="col">
                    Application
                  </th>

                  <th scope="col">
                    Module
                  </th>

                  <th scope="col">
                    Category
                  </th>

                  <th scope="col">
                    Status
                  </th>

                  <th scope="col">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {/* LOADING */}
                {loading ? (
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="7"
                    >
                      Loading tickets...
                    </td>
                  </tr>
                ) : visibleTickets.length === 0 ? (

                  /* NO DATA */
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="7"
                    >
                      No tickets found.
                    </td>
                  </tr>

                ) : (

                  /* DATA */
                  visibleTickets.map((ticket) => (
                    <tr key={ticket.id}>

                      <td>
                        {ticket.ticketNo}
                      </td>

                      <td>
                        {ticket.subject}
                      </td>

                      <td>
                        Application {ticket.application}
                      </td>

                      <td>
                        Module {ticket.module}
                      </td>

                      <td>
                        <span className="tickets-category">
                          {ticket.category}
                        </span>
                      </td>

                      <td>
                        <span className="tickets-status">
                          {ticket.status}
                        </span>
                      </td>

                      <td>
                        <div className="talent-show-row-actions">

                          <button
                            type="button"
                            className="talent-show-button talent-show-button-view"
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket.id}`)
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="talent-show-button talent-show-button-edit"
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket.id}/edit`)
                            }
                          >
                            Edit
                          </button>

                          {statusFilter === 'active' ? (
                            <button
                              type="button"
                              className="talent-show-button talent-show-button-deactivate"
                              onClick={() => handleToggleStatus(ticket, false)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="talent-show-button talent-show-button-activate"
                              onClick={() => handleToggleStatus(ticket, true)}
                            >
                              Activate
                            </button>
                          )}

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
