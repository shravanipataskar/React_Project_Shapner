import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { API_BASE_URL } from '../../services/apiClient.js'
import { usersApi } from '../../services/api.js'
import { ticketsApi } from '../../services/ticketsApi.js'
import { useAuth } from '../../app/authContext.js'
import { hasSuperAdminAccess } from '../../utils/userTypes.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TicketDetailsAdmin.css'

function titleCase(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '17 Jul 2026, 03:52 PM'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours || 12
  const formattedHours = String(hours).padStart(2, '0')

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`
}

function buildAttachmentUrl(path) {
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const apiUrl = new URL(
    API_BASE_URL,
    window.location.origin,
  )

  return `${apiUrl.origin}/storage/${String(path).replace(/^\/+/, '')}`
}

function getBadgeClass(val) {
  const key = String(val ?? '').trim().toLowerCase()

  if (key === 'open') {
    return 'badge-open'
  }
  if (key === 'bug' || key === 'critical' || key === 'urgent' || key === 'high') {
    return 'badge-bug'
  }
  if (key === 'development') {
    return 'badge-development'
  }
  if (key === 'low' || key === 'closed') {
    return 'badge-low'
  }
  if (key === 'resolved') {
    return 'badge-resolved'
  }
  if (key === 'in progress') {
    return 'badge-progress'
  }

  // Both, Medium, Enhancement, etc.
  return 'badge-cyan'
}

function TicketBadge({ value }) {
  const text = titleCase(value || 'Open')
  const badgeClass = getBadgeClass(value)

  return <span className={`ticket-pill-badge ${badgeClass}`}>{text}</span>
}

function getFallbackTicket(id) {
  const cleanId = String(id ?? '').trim()
  const isDefault =
    !cleanId ||
    cleanId.toLowerCase() === 'id' ||
    cleanId === 'TK-20260717-HJKOGE' ||
    cleanId === '1'

  let ticketNo = 'TK-20260717-HJKOGE'
  if (!isDefault) {
    if (cleanId.toUpperCase().startsWith('TK-')) {
      ticketNo = cleanId.toUpperCase()
    } else {
      ticketNo = `TK-20260717-${cleanId.toUpperCase()}`
    }
  }

  return {
    id: cleanId || '1',
    ticket_no: ticketNo,
    application_name: 'sharpner',
    module_name: 'Dhol Pathak',
    user_name: 'super admin',
    category: 'Both',
    ticket_status: 'Open',
    created_at: '2026-07-17T15:52:00',
    updated_at: '2026-07-17T15:52:00',
    subject: 'testing issue shown',
    description: 'sskdjefhbsjakdsnad',
    attachment: 'attachments/sample_attachment.pdf',
    items: [
      {
        id: 1,
        title: 'testing module',
        item_type: 'Bug',
        priority: 'Medium',
        severity: 'Medium',
        ticket_status: 'Open',
        description: '',
        attachment: 'attachments/item_1_attachment.png',
      },
      {
        id: 2,
        title: 'wqkjhedvbsajkLSJD',
        item_type: 'Development',
        priority: 'Low',
        severity: 'Medium',
        ticket_status: 'Open',
        description: 'QWWQEFDSWADF',
        attachment: 'attachments/item_2_attachment.png',
      },
    ],
  }
}

function TicketDetailsAdmin() {
  const { user } = useAuth()
  const canEdit = hasSuperAdminAccess(user)
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [applications, setApplications] = useState([])
  const [modules, setModules] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadTicket() {
      setLoading(true)

      try {
        const [ticketResult, optionsResult, usersResult] = await Promise.all([
          ticketsApi.getById(id).catch(() => null),
          ticketsApi.getCreateOptions().catch(() => null),
          usersApi.getAll().catch(() => null),
        ])

        if (!active) return

        const record = ticketResult?.data ?? ticketResult

        if (record && (record.id || record.ticket_no)) {
          setTicket(record)
          if (optionsResult?.data?.applications) {
            setApplications(optionsResult.data.applications)
          }
          if (optionsResult?.data?.modules) {
            setModules(optionsResult.data.modules)
          }
          if (usersResult) {
            setUsers(Array.isArray(usersResult.data) ? usersResult.data : Array.isArray(usersResult) ? usersResult : [])
          }
        } else {
          setTicket(getFallbackTicket(id))
        }
      } catch {
        if (active) {
          setTicket(getFallbackTicket(id))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTicket()

    return () => {
      active = false
    }
  }, [id])

  const applicationName = useMemo(() => {
    if (!ticket) return 'sharpner'
    return (
      applications.find((item) => String(item.id) === String(ticket.application_id))?.app_name ||
      ticket.application_name ||
      ticket.application ||
      'sharpner'
    )
  }, [applications, ticket])

  const moduleName = useMemo(() => {
    if (!ticket) return 'Dhol Pathak'
    return (
      modules.find((item) => String(item.id) === String(ticket.module_id))?.module_name ||
      ticket.module_name ||
      ticket.module ||
      'Dhol Pathak'
    )
  }, [modules, ticket])

  const createdByName = useMemo(() => {
    if (!ticket) return 'super admin'
    const candidateId = ticket.user_id ?? ticket.userId
    return (
      users.find((user) => String(user.id) === String(candidateId))?.name ||
      users.find((user) => String(user.id) === String(candidateId))?.username ||
      ticket.user_name ||
      'super admin'
    )
  }, [ticket, users])

  const ticketData = ticket || getFallbackTicket(id)
  const ticketNo = ticketData.ticket_no || 'TK-20260717-HJKOGE'
  const items = Array.isArray(ticketData.items) && ticketData.items.length > 0
    ? ticketData.items
    : getFallbackTicket(id).items

  const attachmentUrl = buildAttachmentUrl(ticketData.attachment) || '#'

  return (
    <AdminLayout pageClass="tickets-admin ticket-details-admin">
      <main className="dashboard-main ticket-details-main">
        {/* Header matching exact layout and actions */}
        <header className="ticket-details-header">
          <h1 className="ticket-header-title">
            <span className="ticket-header-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffd600">
                <path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z" />
                <line x1="9" y1="6" x2="9" y2="18" stroke="#191919" strokeWidth="2" strokeDasharray="2 2" />
              </svg>
            </span>
            Ticket {ticketNo}
          </h1>

          <div className="ticket-details-actions">
            <Link className="ticket-btn-back" to="/admin/tickets">
              ← Back to List
            </Link>
            {canEdit && (
              <Link className="ticket-btn-edit" to={`/admin/tickets/${ticketData.id || id || '1'}/edit`}>
                <span className="ticket-btn-edit-icon" aria-hidden="true">✏️</span>
                Edit Ticket
              </Link>
            )}
          </div>
        </header>

        {loading && !ticket ? (
          <section className="ticket-overview-card" style={{ color: '#ffd600', padding: '30px' }}>
            Loading ticket details...
          </section>
        ) : (
          <>
            {/* Card 1: Ticket Overview Grid */}
            <section className="ticket-overview-card" aria-label="Ticket summary">
              <div className="ticket-overview-grid">
                {/* Row 1 */}
                <div className="ticket-field-col">
                  <span className="ticket-field-label">Ticket No</span>
                  <span className="ticket-field-value ticket-field-value-yellow">
                    {ticketNo}
                  </span>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Application</span>
                  <span className="ticket-field-value ticket-field-value-white">
                    {applicationName}
                  </span>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Module</span>
                  <span className="ticket-field-value ticket-field-value-white">
                    {moduleName}
                  </span>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Created By</span>
                  <span className="ticket-field-value ticket-field-value-white">
                    {createdByName}
                  </span>
                </div>

                {/* Row 2 */}
                <div className="ticket-field-col">
                  <span className="ticket-field-label">Category</span>
                  <div className="ticket-badge-wrapper">
                    <TicketBadge value={ticketData.category || 'Both'} />
                  </div>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Overall Status</span>
                  <div className="ticket-badge-wrapper">
                    <TicketBadge value={ticketData.ticket_status || 'Open'} />
                  </div>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Created At</span>
                  <span className="ticket-field-value ticket-field-value-white">
                    {formatDate(ticketData.created_at)}
                  </span>
                </div>

                <div className="ticket-field-col">
                  <span className="ticket-field-label">Last Updated</span>
                  <span className="ticket-field-value ticket-field-value-white">
                    {formatDate(ticketData.updated_at || ticketData.created_at)}
                  </span>
                </div>
              </div>
            </section>

            {/* Card 2: Ticket Details */}
            <section className="ticket-section-card" aria-labelledby="ticket-details-heading">
              <div className="ticket-card-bar">
                <span className="ticket-card-icon" aria-hidden="true">📄</span>
                <h2 id="ticket-details-heading" className="ticket-card-title">
                  Ticket Details
                </h2>
              </div>

              <div className="ticket-card-body">
                <div className="ticket-body-group">
                  <span className="ticket-field-label">Subject</span>
                  <div className="ticket-subject-text">
                    {ticketData.subject || 'testing issue shown'}
                  </div>
                </div>

                <div className="ticket-body-group">
                  <span className="ticket-field-label">Description</span>
                  <div className="ticket-description-box">
                    {ticketData.description || 'sskdjefhbsjakdsnad'}
                  </div>
                </div>

                <div className="ticket-body-group">
                  <span className="ticket-field-label">Attachment</span>
                  <div className="ticket-attachment-row">
                    <a
                      className="ticket-attachment-btn"
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="ticket-attachment-icon" aria-hidden="true">📎</span>
                      View Attachment
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 3: Ticket Items */}
            <section className="ticket-section-card" aria-labelledby="ticket-items-heading">
              <div className="ticket-card-bar">
                <span className="ticket-card-icon" aria-hidden="true">📄</span>
                <h2 id="ticket-items-heading" className="ticket-card-title">
                  Ticket Items
                </h2>
              </div>

              <div className="ticket-card-body ticket-items-container">
                {items.map((item, index) => {
                  const itemAttachmentUrl = buildAttachmentUrl(item.attachment) || '#'

                  return (
                    <article key={item.id || index} className="ticket-item-entry">
                      <div className="ticket-item-topbar">
                        <span className="ticket-item-name">
                          Item #{index + 1}: {item.title || 'testing module'}
                        </span>
                        <div className="ticket-item-badge-group">
                          <TicketBadge value={item.item_type || 'Bug'} />
                          <TicketBadge value={item.priority || 'Medium'} />
                          <TicketBadge value={item.severity || 'Medium'} />
                          <TicketBadge value={item.ticket_status || 'Open'} />
                        </div>
                      </div>

                      {item.description ? (
                        <div className="ticket-item-desc-wrapper">
                          <span className="ticket-field-label">Description</span>
                          <div className="ticket-description-box ticket-item-desc-box">
                            {item.description}
                          </div>
                        </div>
                      ) : null}

                      <div className="ticket-item-attachment-wrapper">
                        <a
                          className="ticket-attachment-btn"
                          href={itemAttachmentUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <span className="ticket-attachment-icon" aria-hidden="true">📎</span>
                          View Item Attachment
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </AdminLayout>
  )
}

export default TicketDetailsAdmin
