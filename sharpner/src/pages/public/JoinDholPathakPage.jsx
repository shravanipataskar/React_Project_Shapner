import { useState } from 'react'
import '../../styles/pages/JoinDholPathakPage.css'

const steps = ['Age Group', 'Form Details', 'Medical & Safety', 'Declaration']
const practiceDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const initialForm = {
  age_group: '',
  full_name: '',
  parent_name: '',
  mobile_number: '',
  city: '',
  address: '',
  school_name: '',
  previous_experience: '',
  own_instrument: '',
  medical_conditions: '',
  emergency_contact: '',
  weekly_availability: '',
  practice_days: [],
  preferred_location: '',
  declarations: [],
  signature: '',
  declaration_date: new Date().toISOString().slice(0, 10),
}

const declarations = [
  'I understand the practice sessions will be held in Pune.',
  'I confirm that I will attend the 55-day practice discipline sincerely.',
  'I understand physical participation is required.',
  'I confirm that the information provided is true.',
]

function JoinDholPathakPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  const toggleArrayValue = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }))
    setErrors((previous) => ({ ...previous, [field]: '' }))
  }

  const validateStep = () => {
    const nextErrors = {}

    if (currentStep === 0 && !form.age_group) {
      nextErrors.age_group = 'Please select an age group.'
    }

    if (currentStep === 1) {
      if (!form.full_name.trim()) nextErrors.full_name = 'Please enter the participant name.'
      if (!form.parent_name.trim()) nextErrors.parent_name = 'Please enter the parent/guardian name.'
      if (!/^[0-9]{10}$/.test(form.mobile_number)) {
        nextErrors.mobile_number = 'Enter a valid 10-digit mobile number.'
      }
      if (!form.city.trim()) nextErrors.city = 'Please enter your city.'
      if (!form.address.trim()) nextErrors.address = 'Please enter your address.'
      if (!form.school_name.trim()) nextErrors.school_name = 'Please enter your school/college name.'
      if (!form.previous_experience) {
        nextErrors.previous_experience = 'Please select an option.'
      }
      if (!form.own_instrument) nextErrors.own_instrument = 'Please select an option.'
    }

    if (currentStep === 2) {
      if (!form.medical_conditions.trim()) {
        nextErrors.medical_conditions = 'Enter medical conditions or write “None”.'
      }
      if (!/^[0-9]{10}$/.test(form.emergency_contact)) {
        nextErrors.emergency_contact = 'Enter a valid 10-digit emergency contact.'
      }
      if (!form.weekly_availability) {
        nextErrors.weekly_availability = 'Please select your weekly availability.'
      }
      if (form.practice_days.length < 4) {
        nextErrors.practice_days = 'Please select at least 4 practice days.'
      }
      if (!form.preferred_location) {
        nextErrors.preferred_location = 'Please select a preferred location.'
      }
    }

    if (currentStep === 3) {
      if (form.declarations.length !== declarations.length) {
        nextErrors.declarations = 'Please accept all required declarations.'
      }
      if (!form.signature.trim()) {
        nextErrors.signature = 'Please enter the parent/guardian full name.'
      }
      if (!form.declaration_date) nextErrors.declaration_date = 'Please select the date.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNext = () => {
    if (!validateStep()) return
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
    scrollToTop()
  }

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
    setErrors({})
    scrollToTop()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validateStep()) return
    setShowSuccess(true)
  }

  const renderError = (name) =>
    errors[name] ? <small className="dhol-error">{errors[name]}</small> : null

  const renderInput = (label, name, type = 'text', options = {}) => (
    <div className={`dhol-field${options.full ? ' dhol-field-full' : ''}`}>
      <label htmlFor={`dhol-${name}`}>
        {label} {options.required !== false && <span>*</span>}
      </label>
      <input
        id={`dhol-${name}`}
        name={name}
        type={type}
        value={form[name]}
        onChange={(event) => updateField(name, event.target.value)}
        autoComplete={options.autoComplete}
      />
      {renderError(name)}
    </div>
  )

  const renderRadioGroup = (label, name, choices, options = {}) => (
    <fieldset className={`dhol-choice-group${options.full ? ' dhol-field-full' : ''}`}>
      <legend>
        {label} {options.required !== false && <span>*</span>}
      </legend>
      <div className="dhol-options">
        {choices.map((choice) => (
          <label className="dhol-option" key={choice}>
            <input
              type="radio"
              name={name}
              value={choice}
              checked={form[name] === choice}
              onChange={(event) => updateField(name, event.target.value)}
            />
            <span>{choice}</span>
          </label>
        ))}
      </div>
      {renderError(name)}
    </fieldset>
  )

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <>
          <h2 className="dhol-section-title">Age Group</h2>
          {renderRadioGroup('Age Group', 'age_group', ['8-10', '11-14', '15-18', '18+'])}
        </>
      )
    }

    if (currentStep === 1) {
      return (
        <>
          <h2 className="dhol-section-title">Form Details</h2>
          <div className="dhol-fields-grid">
            {renderInput('Full Name', 'full_name', 'text', { autoComplete: 'name' })}
            {renderInput('Parent Name', 'parent_name', 'text', { autoComplete: 'name' })}
            {renderInput('Mobile Number', 'mobile_number', 'tel', { autoComplete: 'tel-national' })}
            {renderInput('City', 'city', 'text', { autoComplete: 'address-level2' })}
            <div className="dhol-field">
              <label htmlFor="dhol-address">Address <span>*</span></label>
              <textarea
                id="dhol-address"
                name="address"
                rows="4"
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                autoComplete="street-address"
              />
              {renderError('address')}
            </div>
            {renderInput('School / College Name', 'school_name')}
            {renderRadioGroup('Previous Dhol Experience?', 'previous_experience', ['Yes', 'No'])}
            {renderRadioGroup('Can you bring your own instrument for Dhol Pathak?', 'own_instrument', ['Yes', 'No'])}
          </div>
        </>
      )
    }

    if (currentStep === 2) {
      return (
        <>
          <h2 className="dhol-section-title">Medical &amp; Safety</h2>
          <div className="dhol-fields-grid">
            <div className="dhol-field">
              <label htmlFor="dhol-medical_conditions">
                Medical Conditions (or write “None”) <span>*</span>
              </label>
              <textarea
                id="dhol-medical_conditions"
                name="medical_conditions"
                rows="4"
                value={form.medical_conditions}
                onChange={(event) => updateField('medical_conditions', event.target.value)}
              />
              {renderError('medical_conditions')}
            </div>
            {renderInput('Emergency Contact', 'emergency_contact', 'tel')}
            <div className="dhol-field">
              <label htmlFor="dhol-weekly_availability">Weekly Availability <span>*</span></label>
              <select
                id="dhol-weekly_availability"
                name="weekly_availability"
                value={form.weekly_availability}
                onChange={(event) => updateField('weekly_availability', event.target.value)}
              >
                <option value="">Select Option</option>
                <option value="1-2 days per week">1-2 days per week</option>
                <option value="3-4 days per week">3-4 days per week</option>
                <option value="5-6 days per week">5-6 days per week</option>
                <option value="All days">All days</option>
              </select>
              {renderError('weekly_availability')}
            </div>
            <fieldset className="dhol-choice-group">
              <legend>Preferred Location <span>*</span></legend>
              <div className="dhol-options dhol-location-options">
                {['Narayan Peth, Pune', 'Navale Bridge, Pune'].map((location) => (
                  <label className="dhol-option" key={location}>
                    <input
                      type="radio"
                      name="preferred_location"
                      value={location}
                      checked={form.preferred_location === location}
                      onChange={(event) => updateField('preferred_location', event.target.value)}
                    />
                    <span>{location}</span>
                  </label>
                ))}
              </div>
              {renderError('preferred_location')}
            </fieldset>
            <fieldset className="dhol-choice-group dhol-field-full">
              <legend>Available Practice Days (Min 4) <span>*</span></legend>
              <div className="dhol-options dhol-days-grid">
                {practiceDays.map((day) => (
                  <label className="dhol-option" key={day}>
                    <input
                      type="checkbox"
                      checked={form.practice_days.includes(day)}
                      onChange={() => toggleArrayValue('practice_days', day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {renderError('practice_days')}
            </fieldset>
          </div>
        </>
      )
    }

    return (
      <>
        <h2 className="dhol-section-title">Declaration</h2>
        <div className="dhol-declarations">
          {declarations.map((declaration, index) => (
            <label className="dhol-declaration" key={declaration}>
              <input
                type="checkbox"
                checked={form.declarations.includes(String(index))}
                onChange={() => toggleArrayValue('declarations', String(index))}
              />
              <span>{declaration} <b>*</b></span>
            </label>
          ))}
          {renderError('declarations')}
        </div>
        <div className="dhol-fields-grid dhol-signature-grid">
          {renderInput('Digital Signature (Parent Full Name)', 'signature')}
          {renderInput('Date', 'declaration_date', 'date')}
        </div>
      </>
    )
  }

  const dismissSuccess = () => {
    setShowSuccess(false)
    setCurrentStep(0)
    setForm({
      ...initialForm,
      declaration_date: new Date().toISOString().slice(0, 10),
    })
    setErrors({})
    scrollToTop()
  }

  return (
    <main className="dhol-registration-page">
      <div className="dhol-registration-container">
        <header className="dhol-page-intro">
          <h1>🥁 Join the Dhol Pathak</h1>
          <p>
            A Pune-based Dhol Pathak where children learn rhythm, discipline,
            teamwork and energy through traditional instruments!
          </p>
        </header>

        <form className="dhol-registration-form" onSubmit={handleSubmit} noValidate>
          <div className="dhol-layout">
            <aside className="dhol-steps-card" aria-label="Registration progress">
              <h2>Join the Dhol Pathak (Step)</h2>
              <ol className="dhol-steps-list">
                {steps.map((step, index) => (
                  <li key={step}>
                    <button
                      type="button"
                      className={`dhol-step${index <= currentStep ? ' is-complete' : ''}${index === currentStep ? ' is-active' : ''}`}
                      aria-current={index === currentStep ? 'step' : undefined}
                      onClick={() => {
                        if (index < currentStep) {
                          setCurrentStep(index)
                          setErrors({})
                          scrollToTop()
                        }
                      }}
                    >
                      <span className="dhol-step-number">{index + 1}</span>
                      <span>{step}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </aside>

            <section className="dhol-form-card" aria-live="polite">
              {renderStep()}
              {errors.submit && <p className="dhol-error">{errors.submit}</p>}
            </section>

            <div className="dhol-artist-image" aria-hidden="true">
              <img src="/assets/images/dhol-form.png" alt="" />
            </div>
          </div>

          <div className="dhol-navigation">
            {currentStep > 0 ? (
              <button type="button" className="dhol-previous-button" onClick={handlePrevious}>
                ← Previous
              </button>
            ) : <span />}
            {currentStep < steps.length - 1 ? (
              <button type="button" className="dhol-next-button" onClick={handleNext}>
                NEXT →
              </button>
            ) : (
              <button type="submit" className="dhol-next-button">
                SUBMIT REGISTRATION
              </button>
            )}
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="dhol-modal-overlay">
          <section
            className="dhol-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dhol-success-title"
          >
            <div className="dhol-success-icon" aria-hidden="true">🥁</div>
            <h2 id="dhol-success-title">Dhol Pathak Registration Submitted!</h2>
            <p>
              Thank you for registering for the Dhol Pathak. Our team will
              review your application soon.
            </p>
            <button type="button" onClick={dismissSuccess}>OK</button>
          </section>
        </div>
      )}
    </main>
  )
}

export default JoinDholPathakPage
