import { useState } from 'react'

const stepFields = {
  1: ['brand_name', 'contact_person', 'email'],
  2: ['type_of_promotion', 'budget_range', 'campaign_goal', 'message'],
}

const steps = [
  { number: 1, title: 'Brand Info' },
  { number: 2, title: 'Promotion Details' },
  { number: 3, title: 'Review & Submit' },
]

const promotionTypes = [
  ['sponsored_video', 'Sponsored Video'],
  ['product_placement', 'Product Placement'],
  ['event_sponsorship', 'Event Sponsorship'],
  ['creative_campaign', 'Creative Campaign'],
  ['other', 'Other'],
]

const budgetRanges = [
  ['10k-50k', '₹10K - ₹50K'],
  ['50k-1L', '₹50K - ₹1 Lakh'],
  ['1L-5L', '₹1 Lakh - ₹5 Lakhs'],
  ['5L+', '₹5 Lakhs+'],
]

const initialFormData = {
  brand_name: '',
  contact_person: '',
  email: '',
  instagram_or_website: '',
  type_of_promotion: '',
  budget_range: '',
  campaign_goal: '',
  message: '',
}

const validationMessages = {
  brand_name: 'Please enter your brand name',
  contact_person: 'Please enter contact person name',
  email: 'Please enter a valid email',
  type_of_promotion: 'Please select type of promotion',
  budget_range: 'Please select budget range',
  campaign_goal: 'Please describe your campaign goal',
  message: 'Please write additional message',
}

function CollaboratePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [submitNotice, setSubmitNotice] = useState('')

  function validateField(name, value) {
    if (!value.trim()) {
      return validationMessages[name]
    }

    if (
      name === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      return validationMessages[name]
    }

    return ''
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }))
    }
    setSubmitNotice('')
  }

  function validateStep(step) {
    const nextErrors = {}
    stepFields[step]?.forEach((field) => {
      nextErrors[field] = validateField(field, formData[field])
    })
    setErrors((current) => ({ ...current, ...nextErrors }))

    const firstInvalid = stepFields[step]?.find((field) => nextErrors[field])
    if (firstInvalid) {
      const element = document.getElementById(firstInvalid)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element?.focus()
      return false
    }
    return true
  }

  function goToStep(step) {
    setCurrentStep(step)
    setSubmitNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const invalidStep = [1, 2].find((step) =>
      stepFields[step].some((field) => validateField(field, formData[field])),
    )

    if (invalidStep) {
      setCurrentStep(invalidStep)
      validateStep(invalidStep)
      return
    }

    setSubmitNotice(
      'Your details are ready, but this React UI is not connected to a submission service. Nothing was sent.',
    )
  }

  return (
    <section className="brand-deals-page">
      <div className="brand-deals-intro">
        <h1 className="brand-deals-title">🤝 Brand Collaboration</h1>
        <p>
          Promote your brand to a creative, young audience through our channels.
          Fill out the form below to start your collaboration journey.
        </p>
      </div>

      <div className="brand-deals-layout">
        <aside className="brand-steps-card" aria-label="Collaboration steps">
          <h2>Collaboration Steps</h2>
          <ol className="brand-step-list">
            {steps.map((step) => (
              <li
                className={step.number <= currentStep ? 'is-active' : ''}
                key={step.number}
                aria-current={step.number === currentStep ? 'step' : undefined}
              >
                <span className="brand-step-number">{step.number}</span>
                <span className="brand-step-title">{step.title}</span>
              </li>
            ))}
          </ol>
        </aside>

        <form className="brand-form" noValidate onSubmit={handleSubmit}>
          <section
            className="brand-form-card"
            hidden={currentStep !== 1}
            aria-labelledby="brand-info-heading"
          >
            <h2 id="brand-info-heading">Brand &amp; Contact Information</h2>
            <div className="brand-form-grid">
              <FormField
                name="brand_name"
                label="Brand Name"
                placeholder="Enter your brand name"
                value={formData.brand_name}
                error={errors.brand_name}
                onChange={updateField}
                maxLength={150}
              />
              <FormField
                name="contact_person"
                label="Contact Person"
                placeholder="Name of contact person"
                value={formData.contact_person}
                error={errors.contact_person}
                onChange={updateField}
                maxLength={150}
              />
              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                error={errors.email}
                onChange={updateField}
                maxLength={150}
              />
              <FormField
                name="instagram_or_website"
                label="Instagram / Website"
                optional
                placeholder="Your Instagram handle or website URL"
                value={formData.instagram_or_website}
                onChange={updateField}
                maxLength={255}
              />
            </div>
          </section>

          <section
            className="brand-form-card"
            hidden={currentStep !== 2}
            aria-labelledby="promotion-details-heading"
          >
            <h2 id="promotion-details-heading">Promotion Details</h2>
            <div className="brand-form-grid">
              <SelectField
                name="type_of_promotion"
                label="Type of Promotion"
                placeholder="Select type of promotion"
                options={promotionTypes}
                value={formData.type_of_promotion}
                error={errors.type_of_promotion}
                onChange={updateField}
              />
              <SelectField
                name="budget_range"
                label="Budget Range"
                placeholder="Select budget range"
                options={budgetRanges}
                value={formData.budget_range}
                error={errors.budget_range}
                onChange={updateField}
              />
              <FormField
                name="campaign_goal"
                label="Campaign Goal"
                placeholder="What do you want to achieve with this collaboration?"
                value={formData.campaign_goal}
                error={errors.campaign_goal}
                onChange={updateField}
                multiline
                rows={4}
                className="brand-form-field--full"
              />
              <FormField
                name="message"
                label="Additional Message"
                placeholder="Tell us more about your brand and collaboration idea..."
                value={formData.message}
                error={errors.message}
                onChange={updateField}
                multiline
                rows={5}
                className="brand-form-field--full"
              />
            </div>
          </section>

          <section
            className="brand-form-card brand-review-card"
            hidden={currentStep !== 3}
            aria-labelledby="review-submit-heading"
          >
            <h2 id="review-submit-heading">Review &amp; Submit</h2>
            <p className="brand-review-note">
              <strong>📝 Note:</strong> Submission does not guarantee
              collaboration. Our team will review your request and contact you
              if there&apos;s a suitable opportunity.
            </p>
          </section>

          {submitNotice && (
            <p className="brand-submit-notice" role="status">
              {submitNotice}
            </p>
          )}

          <div className={`brand-form-actions${currentStep === 1 ? ' is-first-step' : ''}`}>
            {currentStep > 1 && (
              <button
                className="brand-previous-button"
                type="button"
                onClick={() => goToStep(currentStep - 1)}
              >
                ← Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                className="brand-next-button"
                type="button"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    goToStep(currentStep + 1)
                  }
                }}
              >
                Next →
              </button>
            ) : (
              <button className="brand-next-button" type="submit">
                Submit Brand Promotion Request
              </button>
            )}
          </div>
        </form>

        <div className="brand-deals-art">
          <img
            src="/assets/images/brand-form.png"
            alt="Two young creators shaking hands beneath a collaboration symbol"
          />
        </div>
      </div>
    </section>
  )
}

function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
  optional = false,
  multiline = false,
  rows,
  maxLength,
  className = '',
}) {
  const Field = multiline ? 'textarea' : 'input'

  return (
    <div className={`brand-form-field ${className}`}>
      <label htmlFor={name}>
        {label}
        {optional ? (
          <span className="brand-field-optional"> (Optional)</span>
        ) : (
          <span className="brand-field-required"> *</span>
        )}
      </label>
      <Field
        id={name}
        name={name}
        type={multiline ? undefined : type}
        required={!optional}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span className="brand-field-error" id={`${name}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}

function SelectField({
  name,
  label,
  placeholder,
  options,
  value,
  error,
  onChange,
}) {
  return (
    <div className="brand-form-field">
      <label htmlFor={name}>
        {label}<span className="brand-field-required"> *</span>
      </label>
      <select
        id={name}
        name={name}
        value={value}
        required
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error && (
        <span className="brand-field-error" id={`${name}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}

export default CollaboratePage
