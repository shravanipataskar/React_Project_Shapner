import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { downloadCsv } from '../../utils/downloadCsv.js'
import { downloadPdf } from '../../utils/downloadPdf.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CollaborationsAdmin.css'

function CollaborationsAdmin() {
  const { pathname } = useLocation()
  const statusFilter = pathname.endsWith('/inactive') ? 'inactive' : 'active'
  const [collaborations] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')

  const visibleCollaborations = useMemo(() => {
    const query = search.toLowerCase()
    return collaborations.filter((collaboration) => {
      const active = collaboration.active !== false
      const matchesStatus = active === (statusFilter === 'active')
      const matchesSearch = [
        collaboration.contactPerson,
        collaboration.email,
      ].some((value) => String(value ?? '').toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [collaborations, search, statusFilter])

  function submitSearch(event) {
    event.preventDefault()
    setSearch(searchText.trim().toLowerCase())
  }

  function resetSearch() {
    setSearchText('')
    setSearch('')
  }

  function exportCollaborations() {
    downloadCsv(
      'brand-deals.csv',
      ['Brand Name', 'Contact Person', 'Email', 'Review Status'],
      visibleCollaborations.map((collaboration) => [
        collaboration.brandName,
        collaboration.contactPerson,
        collaboration.email,
        collaboration.reviewStatus,
      ]),
    )
  }

  function exportCollaborationsPdf() {
    downloadPdf(
      'brand-deals.pdf',
      'Brand Deals',
      ['Brand Name', 'Contact Person', 'Email', 'Review Status'],
      visibleCollaborations.map((collaboration) => [
        collaboration.brandName,
        collaboration.contactPerson,
        collaboration.email,
        collaboration.reviewStatus,
      ]),
    )
  }

  return (
    <AdminLayout
      pageClass={`collaborations-admin${statusFilter === 'inactive' ? ' is-inactive' : ''}`}
    >
      <main className="dashboard-main collaborations-main">
        <header className="collaborations-header">
          <h1>
            <span aria-hidden="true">{statusFilter === 'inactive' ? '⏸️' : '🤝'}</span>
            {statusFilter === 'inactive'
              ? 'Inactive Brand Deals'
              : 'Manage Brand Deals'}
          </h1>
          <div className="collaborations-toolbar" aria-label="Brand deal actions">
            <Link
              className={`talent-show-button talent-show-button-active${statusFilter === 'active' ? ' is-selected' : ''}`}
              to="/admin/collaborations"
              aria-current={statusFilter === 'active' ? 'page' : undefined}
            >
              ✅ Active
            </Link>
            <Link
              className={`talent-show-button talent-show-button-inactive${statusFilter === 'inactive' ? ' is-selected' : ''}`}
              to="/admin/collaborations/inactive"
              aria-current={statusFilter === 'inactive' ? 'page' : undefined}
            >
              ⏸ Inactive
            </Link>
            {statusFilter === 'active' && <Link
              className="talent-show-button talent-show-button-add"
              to="/admin/collaborations/create"
            >
              ➕ Add New
            </Link>}
            {statusFilter === 'active' && <button
              type="button"
              className="talent-show-button talent-show-button-excel"
              onClick={exportCollaborations}
            >
              📊 Export Excel
            </button>}
            {statusFilter === 'active' && <button
              type="button"
              className="talent-show-button talent-show-button-pdf"
              onClick={exportCollaborationsPdf}
            >
              📄 Export PDF
            </button>}
          </div>
        </header>

        <section
          className="talent-show-card collaborations-card"
          aria-label="Brand collaborations"
        >
          <form
            className="talent-show-search collaborations-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label
              className="talent-show-sr-only"
              htmlFor="collaborations-search"
            >
              Search by contact person or email
            </label>
            <input
              id="collaborations-search"
              type="search"
              placeholder="Search by contact person or email..."
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
          </form>

          <div className="talent-show-table-scroll collaborations-table-scroll">
            <table className="talent-show-table collaborations-table">
              <thead>
                <tr>
                  <th scope="col">Brand Name</th>
                  <th scope="col">Contact Person</th>
                  <th scope="col">Email</th>
                  <th scope="col">Review Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCollaborations.length === 0 ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="5">
                      No collaborations found.
                    </td>
                  </tr>
                ) : (
                  visibleCollaborations.map((collaboration) => (
                    <tr key={collaboration.id}>
                      <td>{collaboration.brandName}</td>
                      <td>{collaboration.contactPerson}</td>
                      <td>{collaboration.email}</td>
                      <td>
                        <span className="collaborations-status">
                          {collaboration.reviewStatus}
                        </span>
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

export default CollaborationsAdmin
