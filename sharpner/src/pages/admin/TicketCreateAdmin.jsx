import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { API_BASE_URL } from '../../services/apiClient.js'
import { ticketsApi } from '../../services/ticketsApi.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TicketCreateAdmin.css'

const attachmentAccept =
  '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'
const maxAttachmentSize = 5 * 1024 * 1024
const attachmentHelp =
  'Maximum file size allowed: 5 MB. Supported file formats: JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX.'

function ticketAttachmentUrl(path) {
  const apiUrl = new URL(
    API_BASE_URL,
    window.location.origin,
  )
  return `${apiUrl.origin}/storage/${String(path).replace(/^\/+/, '')}`
}

function formatOptionLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function validateAttachmentSize(event) {
  const file = event.currentTarget.files?.[0]
  event.currentTarget.setCustomValidity(
    file && file.size > maxAttachmentSize
      ? 'Maximum file size allowed is 5 MB.'
      : '',
  )
}

function TicketCreateAdmin() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [itemIds, setItemIds] = useState([0])
  const [nextItemId, setNextItemId] = useState(1)
  const [ticketRecord, setTicketRecord] = useState(null)
  const [loadingTicket, setLoadingTicket] = useState(Boolean(id))
  const [ticketError, setTicketError] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [options, setOptions] = useState({
    applications: [],
    modules: [],
    categories: [],
    item_types: [],
    priorities: [],
    severities: [],
  })
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const availableModules = applicationId
    ? options.modules.filter(
        (module) => String(module.application_id) === applicationId,
      )
    : options.modules

  useEffect(() => {
    let active = true

    ticketsApi.getCreateOptions()
      .then((result) => {
        if (active) {
          setOptions({
            applications: result?.data?.applications ?? [],
            modules: result?.data?.modules ?? [],
            categories: result?.data?.categories ?? [],
            item_types: result?.data?.item_types ?? [],
            priorities: result?.data?.priorities ?? [],
            severities: result?.data?.severities ?? [],
          })
        }
      })
      .catch((requestError) => {
        console.error('Failed to load ticket dropdown data:', requestError)
        if (active) {
          setOptionsError(
            'Unable to load ticket options. Please retry before submitting.',
          )
        }
      })
      .finally(() => {
        if (active) setLoadingOptions(false)
      })

    return () => {
      active = false
    }
  }, [optionsAttempt])

  useEffect(() => {
    if (!id) {
      return
    }

    let active = true
    ticketsApi.getById(id)
      .then((result) => {
        const record = result?.data
        if (!record || String(record.id) !== String(id)) {
          throw new Error('The ticket response did not match the requested ID.')
        }
        if (active) {
          const items = Array.isArray(record.items) ? record.items : []
          setTicketRecord(record)
          setApplicationId(String(record.application_id ?? ''))
          setModuleId(String(record.module_id ?? ''))
          setItemIds(items.length ? items.map((_, index) => index) : [0])
          setNextItemId(items.length || 1)
        }
      })
      .catch((requestError) => {
        console.error('Failed to load ticket for editing:', requestError)
        if (active) {
          setTicketError(requestError.message || 'Unable to load ticket details.')
        }
      })
      .finally(() => {
        if (active) setLoadingTicket(false)
      })

    return () => {
      active = false
    }
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return

    const formData = new FormData(event.currentTarget)
    const payload = new FormData()
    payload.append('application_id', applicationId)
    payload.append('module_id', moduleId)
    payload.append('subject', String(formData.get('subject') ?? '').trim())
    payload.append('category', String(formData.get('category') ?? ''))
    payload.append('description', String(formData.get('description') ?? '').trim())

    const overallAttachment = formData.get('attachment')
    if (overallAttachment instanceof File && overallAttachment.size > 0) {
      payload.append('attachment', overallAttachment)
    }

    for (let index = 0; index < itemIds.length; index += 1) {
      const fields = ['title', 'item_type', 'priority', 'severity', 'description']
      const existingItem = ticketRecord?.items?.[itemIds[index]]
      if (existingItem?.id) {
        payload.append(`items[${index}][id]`, String(existingItem.id))
      }
      fields.forEach((field) => {
        payload.append(
          `items[${index}][${field}]`,
          String(formData.get(`items[${index}][${field}]`) ?? '').trim(),
        )
      })
      const attachment = formData.get(`items[${index}][attachment]`)
      if (attachment instanceof File && attachment.size > 0) {
        payload.append(`items[${index}][attachment]`, attachment)
      }
    }

    setSaving(true)
    setSubmitError('')
    try {
      if (isEditing) {
        await ticketsApi.update(id, payload)
      } else {
        await ticketsApi.create(payload)
        window.alert('Ticket created successfully.')
      }
      navigate('/admin/tickets', { replace: true })
    } catch (requestError) {
      console.error('Failed to create ticket:', requestError)
      setSubmitError(requestError.message || 'Unable to create the ticket.')
    } finally {
      setSaving(false)
    }
  }

  function addTicketItem() {
    setItemIds((items) => [...items, nextItemId])
    setNextItemId((itemId) => itemId + 1)
    window.alert('Item added successfully.')
  }

  function removeTicketItem(itemId) {
    setItemIds((items) => items.filter((id) => id !== itemId))
  }

  if (isEditing && loadingTicket) {
    return (
      <AdminLayout pageClass="tickets-create-admin">
        <main className="dashboard-main tickets-create-main">
          <p role="status">Loading ticket details...</p>
        </main>
      </AdminLayout>
    )
  }

  if (isEditing && ticketError) {
    return (
      <AdminLayout pageClass="tickets-create-admin">
        <main className="dashboard-main tickets-create-main">
          <div className="talent-show-data-message is-error" role="alert">
            <p>{ticketError}</p>
            <Link to="/admin/tickets">← Back to List</Link>
          </div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout pageClass="tickets-create-admin">
      <main className="dashboard-main tickets-create-main">
        <form className="tickets-create-form" onSubmit={handleSubmit}>
          <header className="tickets-create-header">
            <h1>
              <span aria-hidden="true">🎫</span>
              {isEditing
                ? `Edit Ticket ${ticketRecord?.ticket_no ?? ''}`
                : 'Raise New Ticket'}
            </h1>
            <Link className="tickets-create-back" to="/admin/tickets">
              ← Back to List
            </Link>
          </header>

          <section
            className="talent-show-card tickets-create-card"
            aria-label={isEditing ? 'Edit ticket' : 'Raise a new ticket'}
          >
            {optionsError && (
              <div className="talent-show-data-message is-error" role="alert">
                <p>{optionsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadingOptions(true)
                    setOptionsError('')
                    setOptionsAttempt((attempt) => attempt + 1)
                  }}
                >
                  Retry
                </button>
              </div>
            )}
            {submitError && (
              <p className="talent-show-data-message is-error" role="alert">
                {submitError}
              </p>
            )}
            <div className="tickets-create-main-grid">
              <label className="tickets-create-field">
                <span>Application <b>*</b></span>
                <select
                  name="application_id"
                  value={applicationId}
                  onChange={(event) => {
                    setApplicationId(event.target.value)
                    setModuleId('')
                  }}
                  required
                  disabled={loadingOptions || options.applications.length === 0}
                >
                  <option value="" disabled>
                    {loadingOptions
                      ? 'Loading applications...'
                      : options.applications.length
                        ? 'Select Application'
                        : 'No applications available'}
                  </option>
                  {options.applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.app_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tickets-create-field">
                <span>Module <b>*</b></span>
                <select
                  name="module_id"
                  value={moduleId}
                  onChange={(event) => setModuleId(event.target.value)}
                  required
                  disabled={loadingOptions || availableModules.length === 0}
                >
                  <option value="" disabled>
                    {loadingOptions
                      ? 'Loading modules...'
                      : availableModules.length
                        ? 'Select Module'
                        : applicationId
                          ? 'No modules available for this application'
                          : 'No modules available'}
                  </option>
                  {availableModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tickets-create-field">
                <span>Subject <b>*</b></span>
                <input
                  name="subject"
                  type="text"
                  defaultValue={ticketRecord?.subject ?? ''}
                  required
                />
              </label>

              <label className="tickets-create-field">
                <span>Category <b>*</b></span>
                <select
                  name="category"
                  defaultValue={ticketRecord?.category ?? ''}
                  required
                  disabled={loadingOptions || options.categories.length === 0}
                >
                  <option value="" disabled>
                    {loadingOptions
                      ? 'Loading categories...'
                      : options.categories.length
                        ? 'Select Category'
                        : 'No categories available'}
                  </option>
                  {options.categories.map((category) => (
                    <option key={category} value={category}>
                      {formatOptionLabel(category)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="tickets-create-field tickets-create-overall-description">
              <span>Overall Ticket Description <b>*</b></span>
              <textarea
                name="description"
                defaultValue={ticketRecord?.description ?? ''}
                required
              />
            </label>

            <label className="tickets-create-field tickets-create-overall-attachment">
              <span>Overall Ticket Attachment</span>
              {ticketRecord?.attachment && (
                <a
                  href={ticketAttachmentUrl(ticketRecord.attachment)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Current Attachment
                </a>
              )}
              <input
                name="attachment"
                type="file"
                accept={attachmentAccept}
                onChange={validateAttachmentSize}
              />
              <small>{attachmentHelp}</small>
            </label>

            <div className="tickets-create-divider" />

            <section className="tickets-create-items" aria-label="Ticket items">
              <div className="tickets-create-items-heading">
                <h2>
                  <span aria-hidden="true">📄</span>
                  Ticket Items
                </h2>
                <button
                  className="tickets-create-add-item"
                  type="button"
                  onClick={addTicketItem}
                >
                  + Add Item
                </button>
              </div>

              <div className="tickets-create-item-list">
                {itemIds.map((itemId, index) => (
                  <fieldset className="tickets-create-item" key={itemId}>
                    <legend>Item #{index + 1}</legend>
                    {index > 0 && (
                      <button
                        className="tickets-create-remove-item"
                        type="button"
                        onClick={() => removeTicketItem(itemId)}
                        aria-label={`Remove item ${index + 1}`}
                      >
                        🗑 Remove
                      </button>
                    )}
                    <div className="tickets-create-item-grid">
                      <label className="tickets-create-field">
                        <span>Title <b>*</b></span>
                        <input
                          name={`items[${index}][title]`}
                          type="text"
                          defaultValue={ticketRecord?.items?.[itemId]?.title ?? ''}
                          required
                        />
                      </label>

                      <label className="tickets-create-field">
                        <span>Type <b>*</b></span>
                        <select
                          name={`items[${index}][item_type]`}
                          defaultValue={ticketRecord?.items?.[itemId]?.item_type ?? ''}
                          required
                          disabled={loadingOptions || options.item_types.length === 0}
                        >
                          <option value="" disabled>
                            {loadingOptions
                              ? 'Loading types...'
                              : options.item_types.length
                                ? 'Select Type'
                                : 'No types available'}
                          </option>
                          {options.item_types.map((type) => (
                            <option key={type} value={type}>
                              {formatOptionLabel(type)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="tickets-create-field">
                        <span>Priority <b>*</b></span>
                        <select
                          name={`items[${index}][priority]`}
                          defaultValue={ticketRecord?.items?.[itemId]?.priority ?? ''}
                          required
                          disabled={loadingOptions || options.priorities.length === 0}
                        >
                          <option value="" disabled>
                            {loadingOptions
                              ? 'Loading priorities...'
                              : options.priorities.length
                                ? 'Select Priority'
                                : 'No priorities available'}
                          </option>
                          {options.priorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {formatOptionLabel(priority)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="tickets-create-field">
                        <span>Severity <b>*</b></span>
                        <select
                          name={`items[${index}][severity]`}
                          defaultValue={ticketRecord?.items?.[itemId]?.severity ?? ''}
                          required
                          disabled={loadingOptions || options.severities.length === 0}
                        >
                          <option value="" disabled>
                            {loadingOptions
                              ? 'Loading severities...'
                              : options.severities.length
                                ? 'Select Severity'
                                : 'No severities available'}
                          </option>
                          {options.severities.map((severity) => (
                            <option key={severity} value={severity}>
                              {formatOptionLabel(severity)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="tickets-create-field tickets-create-item-attachment">
                        <span>Attachment</span>
                        {ticketRecord?.items?.[itemId]?.attachment && (
                          <a
                            href={ticketAttachmentUrl(ticketRecord.items[itemId].attachment)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Current Attachment
                          </a>
                        )}
                        <input
                          name={`items[${index}][attachment]`}
                          type="file"
                          accept={attachmentAccept}
                          onChange={validateAttachmentSize}
                        />
                        <small>{attachmentHelp}</small>
                      </label>

                      <label className="tickets-create-field tickets-create-item-description">
                        <span>Description</span>
                        <textarea
                          name={`items[${index}][description]`}
                          defaultValue={ticketRecord?.items?.[itemId]?.description ?? ''}
                        />
                      </label>
                    </div>
                  </fieldset>
                ))}
              </div>
            </section>

            <div className="tickets-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/tickets"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
                disabled={saving || loadingOptions || Boolean(optionsError)}
              >
                {saving
                  ? 'Saving...'
                  : isEditing
                    ? 'Update Ticket'
                    : 'Create Ticket'}
              </button>
            </div>
          </section>
        </form>
      </main>
    </AdminLayout>
  )
}

export default TicketCreateAdmin
