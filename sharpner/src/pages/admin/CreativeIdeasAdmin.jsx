import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { downloadCsv } from '../../utils/downloadCsv.js'
import { downloadPdf } from '../../utils/downloadPdf.js'
import { ideasApi } from '../../services/ideasApi.js'
import { API_BASE_URL, apiFetch } from '../../services/apiClient.js'
import { useAuth } from '../../app/authContext.js'
import { hasSuperAdminAccess } from '../../utils/userTypes.js'

import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CreativeIdeasAdmin.css'

const API_URL = `${API_BASE_URL}/creative-ideas`

const PER_PAGE = 10

function normalizeIdea(record) {
  return {
    ...record,

    id: record.id,

    name:
      record.name ??
      record.submitter_name ??
      record.full_name ??
      '',

    reelIdea:
      record.reel_idea ??
      record.reelIdea ??
      record.idea ??
      '',

    reviewStatus:
      record.review_status ??
      record.reviewStatus ??
      record.status_label ??
      '',

    hookLine: record.hook_line ?? '',

    viralReason: record.viral_reason ?? '',

    active: Number(record.status) === 1,
  }
}

function parseApiResponse(payload) {
  let records = []

  /*
   * Laravel response:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: [...]
   * }
   */

  if (Array.isArray(payload)) {
    records = payload
  } else if (Array.isArray(payload?.data)) {
    records = payload.data
  } else if (Array.isArray(payload?.ideas)) {
    records = payload.ideas
  }

  return records.map(normalizeIdea)
}

function CreativeIdeasAdmin() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isInactivePage = pathname.endsWith('/inactive')

  const statusFilter = isInactivePage ? 'inactive' : 'active'

  // Role-based access control - Only Super Admin can edit
  const canEdit = hasSuperAdminAccess(user)
  const isAdmin = !canEdit // Everyone else is view-only

  const [allIdeas, setAllIdeas] = useState([])

  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')

  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [selectedIdea, setSelectedIdea] = useState(null)
  const [changingIdeaIds, setChangingIdeaIds] = useState([])

  // Redirect admin users away from inactive page
  useEffect(() => {
    if (isAdmin && isInactivePage) {
      navigate('/admin/ideas', { replace: true })
    }
  }, [isAdmin, isInactivePage, navigate])

  /*
   * ---------------------------------------------------------
   * FETCH DATA FROM LARAVEL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const controller = new AbortController()

    async function fetchIdeas() {
      try {
        setLoading(true)
        setError('')

        console.log('Fetching Creative Ideas from:', API_URL)

        const apiUrl = new URL(API_URL)
        apiUrl.searchParams.set('status', statusFilter === 'active' ? '1' : '0')

        const response = await apiFetch(apiUrl, {
          method: 'GET',

          headers: {
            Accept: 'application/json',
          },

          signal: controller.signal,
        })

        console.log('Creative Ideas response status:', response.status)

        if (!response.ok) {
          throw new Error(
            `Laravel API returned HTTP ${response.status}`,
          )
        }

        const payload = await response.json()

        console.log('Creative Ideas API response:', payload)

        const records = parseApiResponse(payload)

        console.log('Creative Ideas records:', records)

        setAllIdeas(records)
        setPage(1)
      } catch (err) {
        if (err.name === 'AbortError') {
          return
        }

        console.error('Creative Ideas API error:', err)

        setAllIdeas([])

        setError(
          err.message ||
            'Unable to load Creative Ideas from the backend.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchIdeas()

    return () => {
      controller.abort()
    }
  }, [statusFilter])

  async function handleStatusChange(idea) {
    const nextStatus = idea.active ? 0 : 1

    if (
      nextStatus === 0 &&
      !window.confirm(
        'Are you sure you want to deactivate this creative idea?',
      )
    ) {
      return
    }

    setError('')
    setChangingIdeaIds((previous) => [...previous, idea.id])

    try {
      await ideasApi.updateStatus(idea.id, nextStatus)
      setAllIdeas((previous) =>
        previous.map((item) =>
          item.id === idea.id
            ? { ...item, status: nextStatus, active: nextStatus === 1 }
            : item,
        ),
      )
    } catch (requestError) {
      console.error('Failed to change creative idea status:', requestError)
      setError(
        requestError.message ||
          `Unable to ${nextStatus ? 'activate' : 'deactivate'} this creative idea.`,
      )
    } finally {
      setChangingIdeaIds((previous) =>
        previous.filter((id) => id !== idea.id),
      )
    }
  }

  /*
   * ---------------------------------------------------------
   * FILTER ACTIVE / INACTIVE
   * ---------------------------------------------------------
   */

  const filteredIdeas = useMemo(() => {
    let result = [...allIdeas]

    if (statusFilter === 'active') {
      result = result.filter((idea) => idea.active)
    } else {
      result = result.filter((idea) => !idea.active)
    }

    /*
     * Search by name
     */
    if (search.trim()) {
      const searchValue = search.trim().toLowerCase()

      result = result.filter((idea) => {
        const name = String(idea.name || '').toLowerCase()

        const reelIdea = String(
          idea.reelIdea || '',
        ).toLowerCase()

        return (
          name.includes(searchValue) ||
          reelIdea.includes(searchValue)
        )
      })
    }

    return result
  }, [allIdeas, search, statusFilter])

  /*
   * ---------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIdeas.length / PER_PAGE),
  )

  const currentPage = Math.min(page, totalPages)

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  const paginatedIdeas = useMemo(() => {
    const startIndex = (currentPage - 1) * PER_PAGE

    return filteredIdeas.slice(
      startIndex,
      startIndex + PER_PAGE,
    )
  }, [filteredIdeas, currentPage])

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  function submitSearch(event) {
    event.preventDefault()

    setPage(1)

    setSearch(searchText.trim())
  }

  function resetSearch() {
    setSearchText('')
    setSearch('')
    setPage(1)
  }

  /*
   * ---------------------------------------------------------
   * EXPORT CSV
   * ---------------------------------------------------------
   */

  function exportIdeas() {
    downloadCsv(
      'creative-ideas.csv',

      ['Name', 'Reel Idea', 'Review Status'],

      filteredIdeas.map((idea) => [
        idea.name,
        idea.reelIdea,
        idea.reviewStatus,
      ]),
    )
  }

  /*
   * ---------------------------------------------------------
   * EXPORT PDF
   * ---------------------------------------------------------
   */

  function exportIdeasPdf() {
    downloadPdf(
      'creative-ideas.pdf',

      'Creative Ideas',

      ['Name', 'Reel Idea', 'Review Status'],

      filteredIdeas.map((idea) => [
        idea.name,
        idea.reelIdea,
        idea.reviewStatus,
      ]),
    )
  }

  /*
   * ---------------------------------------------------------
   * PAGE CHANGE
   * ---------------------------------------------------------
   */

  function changePage(nextPage) {
    if (
      nextPage >= 1 &&
      nextPage <= totalPages
    ) {
      setPage(nextPage)
    }
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <AdminLayout
      pageClass={`creative-ideas-admin${
        isInactivePage ? ' is-inactive' : ''
      }`}
    >
      <main className="dashboard-main creative-ideas-main">

        {/* HEADER */}

        <header className="creative-ideas-header">

          <h1>
            <span aria-hidden="true">
              {isInactivePage ? '⏸️' : '💡'}
            </span>

            {isInactivePage
              ? 'Inactive Creative Ideas'
              : 'Manage Creative Ideas'}
          </h1>

          <div
            className="creative-ideas-toolbar"
            aria-label="Creative Ideas actions"
          >

            {/* ACTIVE */}

            <Link
              className={`talent-show-button talent-show-button-active${
                statusFilter === 'active'
                  ? ' is-selected'
                  : ''
              }`}
              to="/admin/ideas"
            >
              ✅ Active
            </Link>

            {/* INACTIVE - Only Super Admin */}

            {canEdit && (
              <Link
                className={`talent-show-button talent-show-button-inactive${
                  statusFilter === 'inactive'
                    ? ' is-selected'
                    : ''
                }`}
                to="/admin/ideas/inactive"
              >
                ⏸ Inactive
              </Link>
            )}

            {/* Add New is available to both admin roles. */}

            {statusFilter === 'active' && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/ideas/create"
              >
                ➕ Add New
              </Link>
            )}

            {/* CSV - Both Admin and Super Admin */}

            {statusFilter === 'active' && (
              <button
                type="button"
                className="talent-show-button talent-show-button-excel"
                onClick={exportIdeas}
                disabled={loading || filteredIdeas.length === 0}
              >
                📊 Export Excel
              </button>
            )}

            {/* PDF - Both Admin and Super Admin */}

            {statusFilter === 'active' && (
              <button
                type="button"
                className="talent-show-button talent-show-button-pdf"
                onClick={exportIdeasPdf}
                disabled={loading || filteredIdeas.length === 0}
              >
                📄 Export PDF
              </button>
            )}

          </div>
        </header>

        {/* MAIN CARD */}

        <section
          className="talent-show-card creative-ideas-card"
          aria-label="Creative Ideas"
        >

          {/* SEARCH */}

          <form
            className="talent-show-search creative-ideas-search"
            onSubmit={submitSearch}
            role="search"
          >

            <label
              className="talent-show-sr-only"
              htmlFor="creative-ideas-search"
            >
              Search Creative Ideas
            </label>

            <input
              id="creative-ideas-search"
              type="search"
              placeholder="Search by name..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              disabled={loading}
            />

            <button
              type="submit"
              className="talent-show-button talent-show-button-search"
              disabled={loading}
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

          {/* ERROR */}

          {error && (
            <div
              style={{
                margin: '20px 0',
                padding: '15px',
                borderRadius: '8px',
                background: '#ffe5e5',
                color: '#b00020',
                fontWeight: '600',
              }}
            >
              {error}
            </div>
          )}

          {/* TABLE */}

          <div className="talent-show-table-scroll creative-ideas-table-scroll">

            <table className="talent-show-table creative-ideas-table">

              <thead>
                <tr>
                  <th scope="col">
                    Name
                  </th>

                  <th scope="col">
                    Reel Idea
                  </th>

                  <th scope="col">
                    Review Status
                  </th>

                  <th scope="col">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {/* LOADING */}

                {loading && (
                  <tr>
                    <td
                      className="talent-show-empty"
                      colSpan="4"
                    >
                      Loading Creative Ideas...
                    </td>
                  </tr>
                )}

                {/* NO DATA */}

                {!loading &&
                  !error &&
                  paginatedIdeas.length === 0 && (
                    <tr>
                      <td
                        className="talent-show-empty"
                        colSpan="4"
                      >
                        No Creative Ideas found.
                      </td>
                    </tr>
                  )}

                {/* DATA */}

                {!loading &&
                  paginatedIdeas.length > 0 &&
                  paginatedIdeas.map((idea) => (
                    <tr key={idea.id}>

                      {/* NAME */}

                      <td>
                        {idea.name || '—'}
                      </td>

                      {/* REEL IDEA */}

                      <td className="creative-ideas-reel">
                        {idea.reelIdea || '—'}
                      </td>

                      {/* REVIEW STATUS */}

                      <td>
                        <span className="creative-ideas-status">

                          {Number(idea.reviewStatus) === 0
                            ? 'Pending'
                            : Number(idea.reviewStatus) === 1
                              ? 'Approved'
                              : Number(idea.reviewStatus) === 2
                                ? 'Rejected'
                                : idea.reviewStatus || '—'}

                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="talent-show-row-actions">

                          <button
                            type="button"
                            className="talent-show-button talent-show-button-view"
                            onClick={() =>
                              setSelectedIdea(idea)
                            }
                          >
                            View
                          </button>

                          {/* Edit - Only Super Admin */}
                          {canEdit && !isInactivePage && (
                            <Link
                              className="talent-show-button talent-show-button-edit"
                              to={`/admin/ideas/${encodeURIComponent(idea.id)}/edit`}
                            >
                              Edit
                            </Link>
                          )}

                          {/* Deactivate/Activate - Only Super Admin */}
                          {canEdit && (
                            <button
                              type="button"
                              className={`talent-show-button ${
                                idea.active
                                  ? 'talent-show-button-deactivate'
                                  : 'talent-show-button-activate'
                              }`}
                              onClick={() => handleStatusChange(idea)}
                              disabled={changingIdeaIds.includes(idea.id)}
                            >
                              {changingIdeaIds.includes(idea.id)
                                ? 'Saving...'
                                : idea.active
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          {!loading &&
            totalPages > 1 && (

              <nav
                className="creative-ideas-pagination"
                aria-label="Pagination"
              >

                <button
                  type="button"
                  onClick={() =>
                    changePage(currentPage - 1)
                  }
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {pageNumbers.map((pageNumber) => (

                  <button
                    type="button"
                    key={pageNumber}
                    className={
                      pageNumber === currentPage
                        ? 'is-current'
                        : ''
                    }
                    onClick={() =>
                      changePage(pageNumber)
                    }
                  >
                    {pageNumber}
                  </button>

                ))}

                <button
                  type="button"
                  onClick={() =>
                    changePage(currentPage + 1)
                  }
                  disabled={
                    currentPage >= totalPages
                  }
                  aria-label="Next page"
                >
                  ›
                </button>

              </nav>

            )}

        </section>

      </main>

      {/* DETAILS MODAL */}

      {selectedIdea && (

        <div
          className="talent-show-modal-backdrop"
          onClick={() =>
            setSelectedIdea(null)
          }
          role="presentation"
        >

          <section
            className="talent-show-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="creative-idea-details-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="talent-show-modal-heading">

              <h2 id="creative-idea-details-title">
                Creative Idea Details
              </h2>

              <button
                type="button"
                className="talent-show-modal-close"
                onClick={() =>
                  setSelectedIdea(null)
                }
                aria-label="Close dialog"
              >
                ×
              </button>

            </div>

            <dl className="talent-show-details creative-idea-details">

              <div>
                <dt>Name</dt>
                <dd>
                  {selectedIdea.name || '—'}
                </dd>
              </div>

              <div>
                <dt>Reel Idea</dt>
                <dd>
                  {selectedIdea.reelIdea || '—'}
                </dd>
              </div>

              <div>
                <dt>Review Status</dt>
                <dd>
                  {Number(selectedIdea.reviewStatus) === 0
                    ? 'Pending'
                    : Number(selectedIdea.reviewStatus) === 1
                      ? 'Approved'
                      : Number(selectedIdea.reviewStatus) === 2
                        ? 'Rejected'
                        : selectedIdea.reviewStatus || '—'}
                </dd>
              </div>

              {selectedIdea.hookLine && (
                <div>
                  <dt>Hook Line</dt>
                  <dd>
                    {selectedIdea.hookLine}
                  </dd>
                </div>
              )}

              {selectedIdea.viralReason && (
                <div>
                  <dt>Why It Could Work</dt>
                  <dd>
                    {selectedIdea.viralReason}
                  </dd>
                </div>
              )}

              {selectedIdea.instagram && (
                <div>
                  <dt>Instagram</dt>
                  <dd>
                    {selectedIdea.instagram}
                  </dd>
                </div>
              )}

              {selectedIdea.email && (
                <div>
                  <dt>Email</dt>
                  <dd>
                    {selectedIdea.email}
                  </dd>
                </div>
              )}

            </dl>

          </section>

        </div>

      )}

    </AdminLayout>
  )
}

export default CreativeIdeasAdmin