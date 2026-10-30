import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import { talentShowApi } from '../../services/talentShowApi.js'
import '../../styles/pages/TalentShow.css'
import '../../styles/pages/TalentShowCreate.css'

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function TalentShowCreate() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = new FormData()
    const textFields = {
      child_name: 'childName',
      parent_name: 'parentName',
      age: 'age',
      city: 'city',
      contact_number: 'contactNumber',
      what_makes_unique: 'childUniqueness',
      talent_description: 'talentDescription',
      social_media: 'socialMediaLink',
      digital_signature: 'digitalSignature',
      signature_date: 'date',
    }

    Object.entries(textFields).forEach(([apiField, formField]) => {
      payload.append(apiField, String(formData.get(formField) ?? '').trim())
    })

    payload.append(
      'declaration_true',
      formData.has('confirmInformation') ? '1' : '0'
    )
    payload.append(
      'declaration_review',
      formData.has('materialConsent') ? '1' : '0',
    )
    payload.append(
      'declaration_parent_presence',
      formData.has('guardianPresence') ? '1' : '0'
    )

    const video = formData.get('talentVideo')
    if (video instanceof File && video.size > 0) {
      payload.append('talent_video', video)
    }

    setSaving(true)
    setError('')
    try {
      await talentShowApi.create(payload)
      window.alert('Talent Show application saved successfully.')
      navigate('/admin/talent-show')
    } catch (requestError) {
      console.error('Failed to save Talent Show application:', requestError)
      setError(requestError.message || 'Unable to save this application.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout pageClass="talent-show-admin talent-show-create-admin">
      <main className="dashboard-main talent-show-main talent-show-create-main">
        <header className="talent-show-create-header">
          <h1>
            <span aria-hidden="true">⭐</span>
            Add New Talent Show Application
          </h1>
          <Link
            className="talent-show-create-back"
            to="/admin/talent-show"
          >
            ← Back
          </Link>
        </header>

        <section
          className="talent-show-create-card"
          aria-labelledby="talent-show-create-title"
        >
          <h2 id="talent-show-create-title">Form Details</h2>
          <form
            className="talent-show-create-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <p className="talent-show-edit-message is-error" role="alert">
                {error}
              </p>
            )}
            <label className="talent-show-create-field">
              <span>Child Name *</span>
              <input name="childName" type="text" required />
            </label>

            <label className="talent-show-create-field">
              <span>Parent Name *</span>
              <input name="parentName" type="text" required />
            </label>

            <label className="talent-show-create-field">
              <span>Age *</span>
              <input name="age" type="number" required />
            </label>

            <label className="talent-show-create-field">
              <span>City *</span>
              <input name="city" type="text" required />
            </label>

            <label className="talent-show-create-field">
              <span>Contact Number *</span>
              <input name="contactNumber" type="tel" required />
            </label>

            <label className="talent-show-create-field is-full-width">
              <span>What makes your child unique?</span>
              <textarea name="childUniqueness" />
            </label>

            <label className="talent-show-create-field is-full-width">
              <span>Talent Description</span>
              <textarea name="talentDescription" />
            </label>

            <label className="talent-show-create-field">
              <span>Upload Talent Video</span>
              <input
                className="talent-show-create-file"
                name="talentVideo"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
              />
              <small>Max 500MB, MP4/MOV/AVI</small>
            </label>

            <label className="talent-show-create-field">
              <span>Social Media Link (Optional)</span>
              <input
                name="socialMediaLink"
                type="url"
                placeholder="https://..."
              />
            </label>

            <fieldset className="talent-show-create-declaration">
              <legend>Declaration</legend>
              <label>
                <input name="confirmInformation" type="checkbox" />
                <span>I confirm that the information provided is true.</span>
              </label>
              <label>
                <input name="materialConsent" type="checkbox" />
                <span>
                  I allow SHARPNER to review and use submitted material for
                  selection purposes.
                </span>
              </label>
              <label>
                <input name="guardianPresence" type="checkbox" />
                <span>
                  Parent/guardian presence will be maintained wherever
                  required.
                </span>
              </label>
            </fieldset>

            <label className="talent-show-create-field">
              <span>Digital Signature (Parent Full Name) *</span>
              <input name="digitalSignature" type="text" required />
            </label>

            <label className="talent-show-create-field">
              <span>Date *</span>
              <input
                name="date"
                type="date"
                lang="en-GB"
                defaultValue={getLocalDate()}
                required
              />
            </label>

            <div className="talent-show-create-actions">
              <Link
                className="talent-show-button talent-show-button-inactive"
                to="/admin/talent-show"
              >
                Cancel
              </Link>
              <button
                className="talent-show-button talent-show-button-add"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AdminLayout>
  )
}

export default TalentShowCreate
