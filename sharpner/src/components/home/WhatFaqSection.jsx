const faqItems = [
  {
    question: 'Is there any registration fee?',
    answer: 'No. There is absolutely no registration fee to join SHARPNER or apply for auditions. Everything is completely free.'
  },
  {
    question: 'Are parents allowed during shoots?',
    answer: 'Yes, parental presence is mandatory during all shoots and auditions. We strictly follow child safety guidelines.'
  },
  {
    question: 'Is the Creative Lab paid?',
    answer: 'No. The Creative Lab is an experimental and unpaid learning platform designed to help creators grow their skills and build real content experience.'
  },
  {
    question: 'Can selected creators become part of the core team later?',
    answer: 'Yes, exceptional performers from the Creative Lab may be invited to join our core team for paid projects and long-term collaborations.'
  },
  {
    question: 'Is prior experience necessary?',
    answer: 'No prior experience is required. We welcome passionate beginners and experienced creators alike. What matters most is your enthusiasm and willingness to learn.'
  },
]

const whatWeDoItems = [
  { icon: 'fa-solid fa-film', label: 'Kids Acting Content' },
  { icon: 'fa-solid fa-book-open', label: 'Storytelling Reels' },
  { icon: 'fa-solid fa-flask', label: 'Educational Experiments' },
  { icon: 'fa-solid fa-lightbulb', label: 'Creative Lab Training' },
  { icon: 'fa-solid fa-users', label: 'Community Collaboration' },
  { icon: 'fa-solid fa-microphone-lines', label: 'Offline Shows' },
]

function WhatFaqSection() {
  return (
    <section className="whatfaq-section">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="what-banner">
              <img src="/assets/images/what-we-do-bg.png" alt="" />
              <div className="what-overlay">
                <h2>What We Do</h2>
                <div className="what-items">
                  {whatWeDoItems.map((item) => (
                    <div className="what-item" key={item.icon}>
                      <i className={item.icon} aria-hidden="true"></i>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="faq-card">
              <div className="section-header">
                <h2>Frequently Asked Questions</h2>
                <p>Everything you need to know about joining the Sharpner Creative Lab.</p>
              </div>
              <div className="faq-wrapper">
                <div className="faq-left">
                  {faqItems.map((item) => (
                    <details className="faq-item" key={item.question}>
                      <summary className="faq-question">{item.question}</summary>
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
                <div className="faq-right">
                  <img src="/assets/images/faq-new.png" alt="Young creator with a magnifying glass" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatFaqSection
