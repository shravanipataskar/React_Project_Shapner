import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CollaborationsAdmin.css'
import '../../styles/pages/CollaborationCreateAdmin.css'

function CollaborationCreateAdmin() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <AdminLayout pageClass="collaborations-admin collaboration-create-admin">
      <main className="dashboard-main collaborations-main collaboration-create-main">
        <header className="collaborations-header collaboration-create-header">
          <h1>
            <span aria-hidden="true">🤝</span>
            Add New Brand Deal
          </h1>
          <Link
            className="collaboration-create-back"
            to="/admin/collaborations"
          >
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card collaboration-create-card"
          aria-label="Add new brand deal"
        >
          <form
            className="collaboration-create-form"
            onSubmit={handleSubmit}
          >
            <div className="collaboration-create-section">
              <h2 className="collaboration-create-section-title">
                Brand &amp; Contact Information
              </h2>
              <div className="collaboration-create-fields">
                <label className="collaboration-create-field">
                  <span>Name</span>
                  <input name="name" type="text" />
                </label>

                <label className="collaboration-create-field">
                  <span>Organization Name</span>
                  <input name="organizationName" type="text" />
                </label>

                <label className="collaboration-create-field">
                  <span>Brand Name *</span>
                  <input name="brandName" type="text" required />
                </label>

                <label className="collaboration-create-field">
                  <span>Contact Person *</span>
                  <input name="contactPerson" type="text" required />
                </label>

                <label className="collaboration-create-field">
                  <span>Email *</span>
                  <input name="email" type="email" required />
                </label>

                <label className="collaboration-create-field">
                  <span>Phone Number</span>
                  <input name="phoneNumber" type="tel" />
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Instagram / Website</span>
                  <input name="website" type="url" />
                </label>
              </div>
            </div>

            <div className="collaboration-create-section is-promotion">
              <h2 className="collaboration-create-section-title">
                Promotion Details
              </h2>
              <div className="collaboration-create-fields">
                <label className="collaboration-create-field">
                  <span>Collaboration Type</span>
                  <select name="collaborationType" defaultValue="brand">
                    <option value="brand">Brand</option>
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Type of Promotion *</span>
                  <select name="promotionType" defaultValue="" required>
                    <option value="" disabled>
                      Select type of promotion
                    </option>
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Budget Range *</span>
                  <select name="budgetRange" defaultValue="" required>
                    <option value="" disabled>
                      Select budget range
                    </option>
                  </select>
                </label>

                <label className="collaboration-create-field">
                  <span>Review Status</span>
                  <select name="reviewStatus" defaultValue="pending">
                    <option value="pending">Pending</option>
                  </select>
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Campaign Goal *</span>
                  <textarea name="campaignGoal" required />
                </label>

                <label className="collaboration-create-field is-full-width">
                  <span>Additional Message *</span>
                  <textarea name="additionalMessage" required />
                </label>
              </div>
            </div>

            <label className="collaboration-create-commercial">
              <input name="commercialInquiry" type="checkbox" />
              <span>Commercial Inquiry</span>
            </label>

            <div className="collaboration-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/collaborations"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
              >
                Save Brand Deal
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default CollaborationCreateAdmin
