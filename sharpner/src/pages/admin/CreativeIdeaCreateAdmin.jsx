import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/CreativeIdeasAdmin.css'
import '../../styles/pages/CreativeIdeaCreateAdmin.css'

function CreativeIdeaCreateAdmin() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <AdminLayout pageClass="creative-ideas-admin">
      <main className="dashboard-main creative-ideas-main creative-idea-create-main">
        <header className="creative-ideas-header creative-idea-create-header">
          <h1>
            <span aria-hidden="true">💡</span>
            Add New Creative Idea
          </h1>
          <Link
            className="creative-idea-create-back"
            to="/admin/ideas"
          >
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-card creative-ideas-card creative-idea-create-card"
          aria-labelledby="creative-idea-create-title"
        >
          <h2 id="creative-idea-create-title">Idea Details</h2>
          <form
            className="creative-idea-create-form"
            onSubmit={handleSubmit}
          >
            <label className="creative-idea-create-field">
              <span>Name *</span>
              <input name="name" type="text" required />
            </label>

            <label className="creative-idea-create-field">
              <span>Instagram Username</span>
              <input
                name="instagramUsername"
                type="text"
                placeholder="@username"
              />
            </label>

            <label className="creative-idea-create-field">
              <span>Email</span>
              <input name="email" type="email" />
            </label>

            <label className="creative-idea-create-field">
              <span>Review Status</span>
              <input name="reviewStatus" type="text" value="Pending" readOnly />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Your Creative Idea *</span>
              <textarea name="creativeIdea" required />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Suggested Hook *</span>
              <input name="suggestedHook" type="text" required />
            </label>

            <label className="creative-idea-create-field is-full-width">
              <span>Why will this work? *</span>
              <textarea name="whyItWillWork" required />
            </label>

            <fieldset className="creative-idea-create-permission">
              <legend>Can SHARPNER use this idea? *</legend>
              <label>
                <input name="permission" type="radio" value="yes" required />
                <span>Yes</span>
              </label>
              <label>
                <input name="permission" type="radio" value="no" required />
                <span>No</span>
              </label>
            </fieldset>

            <div className="creative-idea-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/ideas"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
              >
                Save Idea
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default CreativeIdeaCreateAdmin
