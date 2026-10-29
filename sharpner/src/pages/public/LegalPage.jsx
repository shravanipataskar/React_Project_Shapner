import { useLocation } from 'react-router-dom'

function LegalPage() {
  const { pathname } = useLocation()
  const isTermsPage = pathname === '/terms-conditions'
  const heading = isTermsPage ? 'Terms & Conditions' : 'Privacy Policy'
  const points = isTermsPage
    ? [
        "The selection process will be completely based on SHARPNER's decision",
        'All submissions are voluntary',
        'Content usage rights (as per consent) will remain with SHARPNER',
        'Unpaid participation will be applicable (where specified)',
      ]
    : [
        'Your information will be kept safe and secure',
        'No information will be shared with third parties',
        'Information will only be used for selection and communication purposes',
      ]

  return (
    <section className="legal-page">
      <article
        className={`legal-policy-card${isTermsPage ? ' terms-policy-card' : ''}`}
        aria-labelledby="legal-policy-heading"
      >
        <h1 id="legal-policy-heading">
          <span aria-hidden="true">{isTermsPage ? '📜' : '🔒'}</span> {heading}
        </h1>
        <ul>
          {points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </article>
    </section>
  )
}

export default LegalPage
