import PageIntro from './PageIntro.jsx'

function PagePlaceholder({ title, description, eyebrow }) {
  return (
    <section className="content-page">
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="placeholder-panel">
        <p>We’re preparing this page. Check back soon for more information.</p>
      </div>
    </section>
  )
}

export default PagePlaceholder
