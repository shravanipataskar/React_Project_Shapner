import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { downloadCsv } from '../../utils/downloadCsv.js'
import { downloadPdf } from '../../utils/downloadPdf.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CreativeIdeasAdmin.css'

const apiUrl = import.meta.env.VITE_CREATIVE_IDEAS_API
const perPage = 10

function firstValue(record, ...keys) {
  const key = keys.find((candidate) => record[candidate] !== undefined)
  return key ? record[key] : ''
}

function normalizeIdea(record) {
  const rawActive = firstValue(record, 'is_active', 'active', 'isActive')
  const statusValue = record.status
  const activeValue =
    rawActive ??
    (typeof statusValue === 'string' &&
    ['active', 'inactive', 'disabled'].includes(statusValue.toLowerCase())
      ? statusValue
      : undefined)
  const active =
    typeof activeValue === 'string'
      ? !['inactive', 'disabled', '0', 'false'].includes(
          activeValue.toLowerCase(),
        )
      : activeValue === undefined
        ? true
        : Boolean(activeValue)

  return {
    ...record,
    id: record.id,
    name: firstValue(record, 'name', 'submitter_name', 'full_name'),
    reelIdea: firstValue(record, 'reel_idea', 'reelIdea', 'idea'),
    reviewStatus: firstValue(
      record,
      'review_status',
      'reviewStatus',
      'status_label',
    ),
    active,
  }
}

function parseIdeasResponse(payload) {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.ideas)
        ? payload.ideas
        : null

  if (!records) {
    throw new Error('The Creative Ideas API returned an unsupported response.')
  }

  const pagination = Array.isArray(payload)
    ? {}
    : payload.pagination ?? payload.meta ?? payload

  return {
    ideas: records.map(normalizeIdea),
    currentPage: Number(pagination.current_page ?? pagination.currentPage ?? 1),
    lastPage: Number(
      pagination.last_page ??
        pagination.lastPage ??
        pagination.total_pages ??
        pagination.totalPages ??
        1,
    ),
    total: Number(pagination.total ?? records.length),
  }
}

function CreativeIdeasAdmin() {
  const { pathname } = useLocation()
  const statusFilter = pathname.endsWith('/inactive') ? 'inactive' : 'active'
  const [ideas, setIdeas] = useState([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  })
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [loading, setLoading] = useState(Boolean(apiUrl))

  const fetchIdeas = useCallback(async (signal) => {
    if (!apiUrl) {
      return
    }

    try {
      const requestUrl = new URL(apiUrl, window.location.origin)
      requestUrl.searchParams.set('status', statusFilter)
      requestUrl.searchParams.set('page', String(page))
      requestUrl.searchParams.set('per_page', String(perPage))
      if (search) {
        requestUrl.searchParams.set('search', search)
      }

      const response = await fetch(requestUrl, {
        headers: { Accept: 'application/json' },
        signal,
      })

      if (!response.ok) {
        throw new Error(
          `Unable to load Creative Ideas (HTTP ${response.status}).`,
        )
      }

      const result = parseIdeasResponse(await response.json())
      setIdeas(result.ideas)
      setPagination(result)
      setLoading(false)
    } catch (error) {
      if (error.name !== 'AbortError') {
        setIdeas([])
        setPagination({ currentPage: 1, lastPage: 1, total: 0 })
        setLoading(false)
      }
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => fetchIdeas(controller.signal))
    return () => controller.abort()
  }, [fetchIdeas])

  const pageNumbers = useMemo(
    () => Array.from({ length: pagination.lastPage }, (_, index) => index + 1),
    [pagination.lastPage],
  )

  function submitSearch(event) {
    event.preventDefault()
    const nextSearch = searchText.trim()
    if (apiUrl && (nextSearch !== search || page !== 1)) {
      setLoading(true)
    }
    setPage(1)
    setSearch(nextSearch)
  }

  function resetSearch() {
    if (apiUrl && (searchText || search || page !== 1)) {
      setLoading(true)
    }
    setSearchText('')
    setSearch('')
    setPage(1)
  }

  function exportIdeas() {
    downloadCsv(
      'creative-ideas.csv',
      ['Name', 'Reel Idea', 'Review Status'],
      ideas.map((idea) => [idea.name, idea.reelIdea, idea.reviewStatus]),
    )
  }

  function exportIdeasPdf() {
    downloadPdf(
      'creative-ideas.pdf',
      'Creative Ideas',
      ['Name', 'Reel Idea', 'Review Status'],
      ideas.map((idea) => [idea.name, idea.reelIdea, idea.reviewStatus]),
    )
  }

  function changePage(nextPage) {
    if (nextPage !== page) {
      if (apiUrl) {
        setLoading(true)
      }
      setPage(nextPage)
    }
  }

  return (
    <AdminLayout
      pageClass={`creative-ideas-admin${statusFilter === 'inactive' ? ' is-inactive' : ''}`}
    >
      <main className="dashboard-main creative-ideas-main">
        <header className="creative-ideas-header">
          <h1>
            <span aria-hidden="true">{statusFilter === 'inactive' ? '⏸️' : '💡'}</span>
            {statusFilter === 'inactive'
              ? 'Inactive Creative Ideas'
              : 'Manage Creative Ideas'}
          </h1>
          <div className="creative-ideas-toolbar" aria-label="Creative Ideas actions">
            <Link
              className={`talent-show-button talent-show-button-active${statusFilter === 'active' ? ' is-selected' : ''}`}
              to="/admin/ideas"
              aria-current={statusFilter === 'active' ? 'page' : undefined}
            >
              ✅ Active
            </Link>
            <Link
              className={`talent-show-button talent-show-button-inactive${statusFilter === 'inactive' ? ' is-selected' : ''}`}
              to="/admin/ideas/inactive"
              aria-current={statusFilter === 'inactive' ? 'page' : undefined}
            >
              ⏸ Inactive
            </Link>
            {statusFilter === 'active' && <Link
              className="talent-show-button talent-show-button-add"
              to="/admin/ideas/create"
            >
              ➕ Add New
            </Link>}
            {statusFilter === 'active' && <button
              type="button"
              className="talent-show-button talent-show-button-excel"
              onClick={exportIdeas}
              disabled={loading}
            >
              📊 Export Excel
            </button>}
            {statusFilter === 'active' && <button
              type="button"
              className="talent-show-button talent-show-button-pdf"
              onClick={exportIdeasPdf}
              disabled={loading}
            >
              📄 Export PDF
            </button>}
          </div>
        </header>

        <section className="talent-show-card creative-ideas-card" aria-label="Creative Ideas">
          <form
            className="talent-show-search creative-ideas-search"
            onSubmit={submitSearch}
            role="search"
          >
            <label className="talent-show-sr-only" htmlFor="creative-ideas-search">
              Search Creative Ideas
            </label>
            <input
              id="creative-ideas-search"
              type="search"
              placeholder="Search by name..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
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

          <div className="talent-show-table-scroll creative-ideas-table-scroll">
            <table className="talent-show-table creative-ideas-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Reel Idea</th>
                  <th scope="col">Review Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="4">
                      Loading Creative Ideas...
                    </td>
                  </tr>
                ) : ideas.length === 0 ? (
                  <tr>
                    <td className="talent-show-empty" colSpan="4">
                      No Creative Ideas found.
                    </td>
                  </tr>
                ) : (
                  ideas.map((idea) => (
                    <tr key={idea.id}>
                      <td>{idea.name}</td>
                      <td className="creative-ideas-reel">{idea.reelIdea}</td>
                      <td>
                        <span className="creative-ideas-status">
                          {idea.reviewStatus || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="talent-show-row-actions">
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-view"
                            onClick={() => setSelectedIdea(idea)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-edit"
                            disabled
                            title="Connect the existing update endpoint to enable editing."
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="talent-show-button talent-show-button-deactivate"
                            disabled
                            title="Connect the existing deactivate endpoint to enable this action."
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

          {!loading && pagination.lastPage > 1 && (
            <nav className="creative-ideas-pagination" aria-label="Pagination">
              <button
                type="button"
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={pageNumber === pagination.currentPage ? 'is-current' : ''}
                  onClick={() => changePage(pageNumber)}
                  aria-current={
                    pageNumber === pagination.currentPage ? 'page' : undefined
                  }
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => changePage(Math.min(pagination.lastPage, page + 1))}
                disabled={page >= pagination.lastPage}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          )}
        </section>
      </main>

      {selectedIdea && (
        <div
          className="talent-show-modal-backdrop"
          onClick={() => setSelectedIdea(null)}
          role="presentation"
        >
          <section
            className="talent-show-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="creative-idea-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="talent-show-modal-heading">
              <h2 id="creative-idea-details-title">Creative Idea Details</h2>
              <button
                type="button"
                className="talent-show-modal-close"
                onClick={() => setSelectedIdea(null)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <dl className="talent-show-details creative-idea-details">
              <div><dt>Name</dt><dd>{selectedIdea.name || '—'}</dd></div>
              <div><dt>Reel Idea</dt><dd>{selectedIdea.reelIdea || '—'}</dd></div>
              <div><dt>Review Status</dt><dd>{selectedIdea.reviewStatus || '—'}</dd></div>
              {selectedIdea.hook_line && (
                <div><dt>Hook Line</dt><dd>{selectedIdea.hook_line}</dd></div>
              )}
              {selectedIdea.viral_reason && (
                <div><dt>Why It Could Work</dt><dd>{selectedIdea.viral_reason}</dd></div>
              )}
            </dl>
          </section>
        </div>
      )}
    </AdminLayout>
  )
}

export default CreativeIdeasAdmin
