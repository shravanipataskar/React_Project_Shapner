import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { talentShowApi } from '../../services/talentShowApi.js';
import { downloadCsv } from '../../utils/downloadCsv.js';
import { downloadPdf } from '../../utils/downloadPdf.js';
import '../../styles/pages/TalentShow.css';

const applicationFields = [
  ['childName', 'Child Name'],
  ['contactNo', 'Contact No'],
  ['parentName', 'Parent Name'],
  ['age', 'Age'],
  ['city', 'City'],
];

function getValue(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return '';
}

function normalizeApplication(record, index) {
  const rawStatus = getValue(record, 'status', 'is_active', 'active');

  const active =
    rawStatus === ''
      ? true
      : typeof rawStatus === 'string'
        ? !['inactive', 'disabled', '0', 'false'].includes(
            rawStatus.toLowerCase()
          )
        : Boolean(rawStatus);

  return {
    id: getValue(record, 'id') || `application-${index}`,
    childName: getValue(
      record,
      'childName',
      'child_name',
      'name'
    ),
    contactNo: getValue(
      record,
      'contactNo',
      'contact_no',
      'contact_number',
      'mobile_number',
      'phone'
    ),
    parentName: getValue(
      record,
      'parentName',
      'parent_name',
      'guardian_name'
    ),
    age: getValue(record, 'age', 'child_age'),
    city: getValue(record, 'city', 'parent_city'),
    active,
    details: record,
  };
}

function getApplicationList(payload) {
  // A plain JSON array.
  if (Array.isArray(payload)) {
    return payload;
  }

  // Laravel pagination response: { data: [...], current_page: 1, ... }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  // Alternative API response: { applications: [...] }
  if (Array.isArray(payload?.applications)) {
    return payload.applications;
  }

  throw new Error(
    'Unexpected API response. Expected an array of Talent Show applications.'
  );
}

export default function TalentShow() {
  const { pathname } = useLocation();

  const statusFilter = pathname.endsWith('/inactive')
    ? 'inactive'
    : 'active';

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [changingApplicationId, setChangingApplicationId] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      setLoading(true);
      setError('');

      try {
        const payload = await talentShowApi.getAll({
          status: statusFilter,
          search: appliedSearch,
          page: currentPage,
          signal: controller.signal,
        });
        const records = getApplicationList(payload);

        if (!controller.signal.aborted) {
          setApplications(records.map(normalizeApplication));
          setCurrentPage(Number(payload.current_page || currentPage));
          setLastPage(Number(payload.last_page || 1));
          setTotal(Number(payload.total ?? records.length));
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          console.error(
            'Failed to load Talent Show applications:',
            fetchError
          );
          if (!controller.signal.aborted) {
            setApplications([]);
            setTotal(0);
            setLastPage(1);
            setError('Unable to load applications. Please try again.');
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => controller.abort();
  }, [statusFilter, appliedSearch, currentPage, retryCount]);

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        application.active === (statusFilter === 'active');

      const matchesSearch =
        !query ||
        [
          application.childName,
          application.contactNo,
          application.parentName,
          application.age,
          application.city,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  function handleReset() {
    setSearch('');
    setAppliedSearch('');
    setCurrentPage(1);
  }

  function handleSearch(event) {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(search.trim());
  }

  function handleRetry() {
    setRetryCount((count) => count + 1);
  }

  async function handleStatusChange(application, nextStatus) {
    if (
      application.active &&
      !window.confirm('Are you sure you want to deactivate this application?')
    ) {
      return;
    }

    setChangingApplicationId(application.id);
    setActionError('');

    try {
      await talentShowApi.update(application.id, { status: nextStatus });
      setCurrentPage(1);
      setRetryCount((count) => count + 1);
    } catch (statusError) {
      console.error('Failed to update Talent Show application status:', statusError);
      setActionError(
        nextStatus === 0
          ? 'Unable to deactivate this application. Please try again.'
          : 'Unable to activate this application. Please try again.'
      );
    } finally {
      setChangingApplicationId(null);
    }
  }

  function handlePageChange(nextPage) {
    if (nextPage >= 1 && nextPage <= lastPage && nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  }

  function handleExportExcel() {
    downloadCsv(
      'talent-show-applications.csv',
      applicationFields.map(([, label]) => label),
      visibleApplications.map((application) =>
        applicationFields.map(([field]) => application[field])
      )
    );
  }

  function handleExportPdf() {
    downloadPdf(
      'talent-show-applications.pdf',
      'Talent Show Applications',
      applicationFields.map(([, label]) => label),
      visibleApplications.map((application) =>
        applicationFields.map(([field]) => application[field])
      )
    );
  }

  return (
    <AdminLayout
      pageClass={`talent-show-admin${
        statusFilter === 'inactive' ? ' is-inactive' : ''
      }`}
    >
      <main className="dashboard-main talent-show-main">
        <header className="talent-show-header">
          <h1>
            <span aria-hidden="true">
              {statusFilter === 'inactive' ? '⏸️' : '🏆'}
            </span>{' '}
            {statusFilter === 'inactive'
              ? 'Inactive Talent Show Applications'
              : 'Manage Talent Show Applications'}
          </h1>

          <div
            className="talent-show-toolbar"
            aria-label="Application actions"
          >
            <Link
              className={`talent-show-button talent-show-button-active${
                statusFilter === 'active' ? ' is-selected' : ''
              }`}
              to="/admin/talent-show"
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
              to="/admin/talent-show/inactive"
              aria-current={
                statusFilter === 'inactive' ? 'page' : undefined
              }
            >
              ⏸️ Inactive
            </Link>

            {statusFilter === 'active' && (
              <Link
                className="talent-show-button talent-show-button-add"
                to="/admin/talent-show/create"
              >
                ➕ Add New
              </Link>
            )}

            {statusFilter === 'active' && (
              <button
                type="button"
                className="talent-show-button talent-show-button-excel"
                onClick={handleExportExcel}
                disabled={loading || Boolean(error)}
              >
                📊 Export Excel
              </button>
            )}

            {statusFilter === 'active' && (
              <button
                type="button"
                className="talent-show-button talent-show-button-pdf"
                onClick={handleExportPdf}
                disabled={loading || Boolean(error)}
              >
                📄 Export PDF
              </button>
            )}
          </div>
        </header>

        <section
          className="talent-show-card"
          aria-label="Talent Show applications"
        >
          <form
            className="talent-show-search"
            onSubmit={handleSearch}
            role="search"
          >
            <label
              className="talent-show-sr-only"
              htmlFor="talent-show-search"
            >
              Search applications
            </label>

            <input
              id="talent-show-search"
              type="search"
              placeholder="Search by child name, age, city or contact..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
              onClick={handleReset}
            >
              ✕ Reset
            </button>
          </form>

          {actionError && (
            <p className="talent-show-data-message is-error" role="alert">
              {actionError}
            </p>
          )}

          <div className="talent-show-table-scroll">
            <table className="talent-show-table">
              <thead>
                <tr>
                  <th scope="col">Child Name</th>
                  <th scope="col">Contact No</th>
                  <th scope="col">Parent Name</th>
                  <th scope="col">Age</th>
                  <th scope="col">City</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="talent-show-empty" colSpan={6}>
                      Loading Talent Show applications...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="talent-show-empty" colSpan={6}>
                      <p>{error}</p>

                      <button
                        type="button"
                        className="talent-show-button talent-show-button-search"
                        onClick={handleRetry}
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : visibleApplications.length > 0 ? (
                  visibleApplications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.childName || '—'}</td>
                      <td>{application.contactNo || '—'}</td>
                      <td>{application.parentName || '—'}</td>
                      <td>{application.age || '—'}</td>
                      <td>{application.city || '—'}</td>

                      <td>
                        <div className="talent-show-row-actions">
                          <Link
                            className="talent-show-button talent-show-button-view"
                            to={`/admin/talent-show/${encodeURIComponent(application.id)}`}
                          >
                            View
                          </Link>

                          {application.active && (
                            <Link
                              className="talent-show-button talent-show-button-edit"
                              to={`/admin/talent-show/${encodeURIComponent(application.id)}/edit`}
                            >
                              Edit
                            </Link>
                          )}

                          <button
                            type="button"
                            className={`talent-show-button ${
                              application.active
                                ? 'talent-show-button-deactivate'
                                : 'talent-show-button-activate'
                            }`}
                            disabled={changingApplicationId === application.id}
                            onClick={() =>
                              handleStatusChange(application, application.active ? 0 : 1)
                            }
                          >
                            {changingApplicationId === application.id
                              ? 'Updating...'
                              : application.active
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="talent-show-empty" colSpan={6}>
                      No {statusFilter} applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="talent-show-results-count">
            Showing {applications.length} of {total} {statusFilter} applications
          </div>
          {lastPage > 1 && (
            <nav className="talent-show-pagination" aria-label="Pagination">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                aria-label="Previous page"
              >
                ‹
              </button>
              <span>
                Page {currentPage} of {lastPage}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage || loading}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}