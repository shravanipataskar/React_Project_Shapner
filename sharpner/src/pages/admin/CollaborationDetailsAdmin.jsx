import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { collaborationsApi } from "../../services/collaborationsApi.js";
import "../../styles/pages/TalentShow.css";
import "../../styles/pages/CollaborationsAdmin.css";
import "../../styles/pages/CollaborationDetailsAdmin.css";

function CollaborationDetailsAdmin() {
  const { id } = useParams();
  const [collaboration, setCollaboration] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCollaboration() {
      setLoading(true);
      setError("");

      try {
        const result = await collaborationsApi.getById(id);
        const record = result?.data ?? result;

        if (result?.success === false || !record?.id) {
          throw new Error(result?.message || "Brand Deal not found.");
        }

        if (active) {
          setCollaboration(record);
          setReviewStatus(String(record.review_status ?? 0));
        }
      } catch (requestError) {
        if (active) {
          console.error("Failed to load Brand Deal:", requestError);
          setError(requestError.message || "Unable to load this Brand Deal.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCollaboration();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleReviewStatusUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await collaborationsApi.updateReviewStatus(
        id,
        Number(reviewStatus),
      );
      const updatedRecord = result?.data;
      if (updatedRecord) {
        setCollaboration(updatedRecord);
      } else {
        setCollaboration((previous) => ({
          ...previous,
          review_status: Number(reviewStatus),
        }));
      }
      setMessage("Review status updated successfully.");
    } catch (requestError) {
      console.error("Failed to update Brand Deal review status:", requestError);
      setError(requestError.message || "Unable to update review status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout pageClass="collaborations-admin collaboration-details-admin">
      <main className="dashboard-main collaborations-main collaboration-details-main">
        <header className="collaborations-header collaboration-details-header">
          <h1>
            <span aria-hidden="true">🤝</span>
            Brand Deal Details
          </h1>
          <Link className="collaboration-details-back" to="/admin/collaborations">
            ← Back
          </Link>
        </header>

        {loading ? (
          <div className="talent-show-card collaboration-details-card" role="status">
            Loading Brand Deal...
          </div>
        ) : error && !collaboration ? (
          <div className="talent-show-card collaboration-details-card is-error" role="alert">
            {error}
          </div>
        ) : collaboration ? (
          <>
            <section
              className="talent-show-card collaboration-details-card"
              aria-labelledby="collaboration-basic-info"
            >
              <h2 id="collaboration-basic-info">Basic Information</h2>
              <dl className="collaboration-details-grid">
                <div>
                  <dt>Brand Name:</dt>
                  <dd>{collaboration.brand_name || collaboration.organization_name || "—"}</dd>
                </div>
                <div>
                  <dt>Contact Person:</dt>
                  <dd>{collaboration.contact_person || collaboration.name || "—"}</dd>
                </div>
                <div>
                  <dt>Email:</dt>
                  <dd>{collaboration.email || "—"}</dd>
                </div>
                <div>
                  <dt>Phone Number:</dt>
                  <dd>{collaboration.phone_number || "N/A"}</dd>
                </div>
                <div>
                  <dt>Instagram/Website:</dt>
                  <dd>{collaboration.instagram_or_website || "—"}</dd>
                </div>
                <div>
                  <dt>Type of Promotion:</dt>
                  <dd>{collaboration.type_of_promotion || "—"}</dd>
                </div>
                <div>
                  <dt>Budget Range:</dt>
                  <dd>{collaboration.budget_range || "—"}</dd>
                </div>
                <div>
                  <dt>Campaign Goal:</dt>
                  <dd>{collaboration.campaign_goal || "—"}</dd>
                </div>
                <div className="is-full-width">
                  <dt>Message:</dt>
                  <dd>{collaboration.message || "—"}</dd>
                </div>
              </dl>
            </section>

            <section
              className="talent-show-card collaboration-details-card collaboration-details-status-card"
              aria-labelledby="collaboration-update-status"
            >
              <h2 id="collaboration-update-status">Update Status</h2>
              <form onSubmit={handleReviewStatusUpdate}>
                <label className="collaboration-details-status-field">
                  <span>Review Status</span>
                  <select
                    value={reviewStatus}
                    onChange={(event) => setReviewStatus(event.target.value)}
                  >
                    <option value="0">Pending</option>
                    <option value="1">Reviewed</option>
                    <option value="2">Rejected</option>
                  </select>
                </label>
                <div className="collaboration-details-status-actions">
                  <button
                    type="submit"
                    className="talent-show-button talent-show-button-search"
                    disabled={saving}
                  >
                    {saving ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </form>
              {error && <p className="collaboration-details-error" role="alert">{error}</p>}
              {message && <p className="collaboration-details-success" role="status">{message}</p>}
            </section>
          </>
        ) : null}
      </main>
    </AdminLayout>
  );
}

export default CollaborationDetailsAdmin;
