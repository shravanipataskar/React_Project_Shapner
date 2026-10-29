import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TicketCreateAdmin.css'

const attachmentAccept =
  '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'
const maxAttachmentSize = 5 * 1024 * 1024
const attachmentHelp =
  'Maximum file size allowed: 5 MB. Supported file formats: JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX.'

function validateAttachmentSize(event) {
  const file = event.currentTarget.files?.[0]
  event.currentTarget.setCustomValidity(
    file && file.size > maxAttachmentSize
      ? 'Maximum file size allowed is 5 MB.'
      : '',
  )
}

function TicketCreateAdmin() {
  const [itemCount, setItemCount] = useState(1)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <AdminLayout pageClass="tickets-create-admin">
      <main className="dashboard-main tickets-create-main">
        <header className="tickets-create-header">
          <h1>
            <span aria-hidden="true">🎟️</span>
            Raise New Ticket
          </h1>
          <Link className="tickets-create-back" to="/admin/tickets">
            ← Back to List
          </Link>
        </header>

        <section
          className="talent-show-card tickets-create-card"
          aria-label="Raise a new ticket"
        >
          <form className="tickets-create-form" onSubmit={handleSubmit}>
            <div className="tickets-create-main-grid">
              <label className="tickets-create-field">
                <span>Application <b>*</b></span>
                <select name="application" defaultValue="" required>
                  <option value="" disabled>
                    Select Application
                  </option>
                </select>
              </label>

              <label className="tickets-create-field">
                <span>Module <b>*</b></span>
                <select name="module" defaultValue="" required>
                  <option value="" disabled>
                    Select Module
                  </option>
                </select>
              </label>

              <label className="tickets-create-field">
                <span>Subject <b>*</b></span>
                <input name="subject" type="text" required />
              </label>

              <label className="tickets-create-field">
                <span>Category <b>*</b></span>
                <select name="category" defaultValue="" required>
                  <option value="" disabled>
                    Select Category
                  </option>
                </select>
              </label>
            </div>

            <label className="tickets-create-field tickets-create-overall-description">
              <span>Overall Ticket Description <b>*</b></span>
              <textarea name="description" required />
            </label>

            <label className="tickets-create-field tickets-create-overall-attachment">
              <span>Overall Ticket Attachment</span>
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
                  onClick={() => setItemCount((count) => count + 1)}
                >
                  + Add Item
                </button>
              </div>

              <div className="tickets-create-item-list">
                {Array.from({ length: itemCount }, (_, index) => (
                  <fieldset className="tickets-create-item" key={index}>
                    <legend>Item #{index + 1}</legend>
                    <div className="tickets-create-item-grid">
                      <label className="tickets-create-field">
                        <span>Title <b>*</b></span>
                        <input
                          name={`items[${index}][title]`}
                          type="text"
                          required
                        />
                      </label>

                      <label className="tickets-create-field">
                        <span>Type <b>*</b></span>
                        <select
                          name={`items[${index}][type]`}
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            Select Type
                          </option>
                        </select>
                      </label>

                      <label className="tickets-create-field">
                        <span>Priority <b>*</b></span>
                        <select
                          name={`items[${index}][priority]`}
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            Select Priority
                          </option>
                        </select>
                      </label>

                      <label className="tickets-create-field">
                        <span>Severity <b>*</b></span>
                        <select
                          name={`items[${index}][severity]`}
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            Select Severity
                          </option>
                        </select>
                      </label>

                      <label className="tickets-create-field tickets-create-item-attachment">
                        <span>Attachment</span>
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
                        <textarea name={`items[${index}][description]`} />
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
              >
                Create Ticket
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default TicketCreateAdmin
