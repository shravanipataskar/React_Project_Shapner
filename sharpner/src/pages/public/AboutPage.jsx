import '../../styles/pages/about.css'

const IMAGE_PATH = '/assets/images/'

const founders = [
  {
    name: 'Milind Ladge',
    role: 'Founder of Aryan World School, Pune.',
    image: 'World best MD.jpg',
  },
  {
    name: 'Pranav Ladage',
    role: 'Founder of Aryans Edutainment.',
    image: 'best coo in pune world india maharashtra.jpg',
  },
  {
    name: 'Sooraj Khatavkar',
    role: 'Director & Driving Force.',
    image: 'Sooraj.png',
  },
]

const reasons = [
  'Young kids explore their creativity',
  'They get an opportunity to express themselves',
  'And they get the right direction to expand',
]

const experiments = [
  {
    number: '01',
    title: 'Learn By Creating',
    description:
      'Instead of only teaching theory, we encourage creators to build real content, experiment with ideas and learn through practical experience.',
  },
  {
    number: '02',
    title: 'Fearless Storytelling',
    description:
      'We push creators to explore bold ideas, unique storytelling formats and meaningful narratives.',
  },
  {
    number: '03',
    title: 'Creative Collaboration',
    description:
      'Great ideas grow when creative minds work together. SHARPNER connects creators, writers, performers and thinkers.',
  },
]

const teamMembers = ['Sanket', 'Sahil', 'Vishal', 'Neeraj', 'Surya']

function SectionTitle({ children, icon }) {
  return (
    <h2 className="about-section-title">
      {icon && <span className="about-title-icon" aria-hidden="true">{icon}</span>}
      {children}
    </h2>
  )
}

function ReasonsCard() {
  return (
    <div className="about-reasons-card">
      <ul>
        {reasons.map((reason) => (
          <li key={reason}>
            <span aria-hidden="true">✨</span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-container about-hero-inner">
        <div className="about-hero-content">
          <h1>About SHARPNER</h1>
          <p className="about-hero-subtitle">
            A creative lab where storytelling, acting and bold ideas turn into powerful digital content.
          </p>
          <p>
            SHARPNER was started with a simple idea — to create a space where creativity is encouraged and experiments are celebrated. In a world where most people consume content, SHARPNER aims to build creators.
          </p>
        </div>
        <div className="about-hero-image">
          <img src={`${IMAGE_PATH}100 k followers.png`} alt="The SHARPNER creative team" />
        </div>
      </div>
    </section>
  )
}

function ReasonToStart() {
  return (
    <section className="about-story">
      <div className="about-container">
        <SectionTitle icon="🔥">Reason to Start SHARPNER</SectionTitle>
        <div className="about-story-content">
          <div className="about-story-intro">
            <p className="about-highlight">SHARPNER is not just a channel…</p>
            <p className="about-story-bold">it is a movement of young kids.</p>
          </div>
          <p className="about-platform-label">A platform where:</p>
          <ReasonsCard />
          <div className="about-story-transition">
            <p>In today's world, big voices speak and small ones listen…</p>
            <p>But at SHARPNER —</p>
          </div>
          <p className="about-story-quote">
            Now, the little ones will speak... and the elders will listen.
          </p>
          <div className="about-story-identity">
            <p>This is our beginning...</p>
            <p>This is our identity.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FounderInformation() {
  return (
    <section className="about-founders">
      <div className="about-container">
        <SectionTitle icon="👤">Founder Information</SectionTitle>
        <div className="about-founder-grid">
          {founders.map((founder) => (
            <article className="about-founder" key={founder.name}>
              <div className="about-founder-image">
                <img src={`${IMAGE_PATH}${founder.image}`} alt={founder.name} loading="lazy" />
              </div>
              <h3>{founder.name}</h3>
              <p>{founder.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function MissionSection() {
  return (
    <section className="about-mission">
      <div className="about-container">
        <img
          src={`${IMAGE_PATH}Mission.png`}
          alt="Our Mission — empowering young minds to create, express and shine"
          loading="lazy"
        />
      </div>
    </section>
  )
}

function ExperimentalMindset() {
  return (
    <section className="about-experiments">
      <div className="about-container">
        <div className="about-experiments-heading">
          <SectionTitle>Our Experimental Mindset</SectionTitle>
          <p>We believe creativity grows when people are allowed to experiment, fail and try again.</p>
        </div>
        <div className="about-experiment-grid">
          {experiments.map((experiment) => (
            <article className="about-experiment-card" key={experiment.number}>
              <div className="about-experiment-number">{experiment.number}</div>
              <h3>{experiment.title}</h3>
              <p>{experiment.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FutureDream() {
  return (
    <section className="about-future">
      <div className="about-container">
        <img
          src={`${IMAGE_PATH}file_00000000dbe071fa829eae29b4ed95e4.png`}
          alt="Our Future Dream"
          loading="lazy"
        />
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="about-contact">
      <div className="about-contact-card">
        <SectionTitle>Contact Us</SectionTitle>
        <div className="about-contact-item">
          <span>Email:</span>
          <a href="mailto:sharpner.aws@gmail.com">sharpner.aws@gmail.com</a>
        </div>
        <div className="about-contact-item">
          <span>Phone:</span>
          <a href="tel:+918698302525">8698302525</a>
        </div>
        <div className="about-contact-item">
          <span>Instagram:</span>
          <a href="https://www.instagram.com/sharpnerworld/" target="_blank" rel="noreferrer">
            @sharpnerworld
          </a>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  return (
    <section className="about-team">
      <div className="about-container">
        <div className="about-team-heading">
          <SectionTitle icon="👥">SHARPNER Team</SectionTitle>
          <p>
            The SHARPNER Team is the perfect combination of dedication and creativity — the strong pillars who make it all happen.
          </p>
        </div>
        <div className="about-team-grid">
          {teamMembers.map((member) => (
            <article className="about-team-card" key={member}>
              <div className="about-team-star" aria-hidden="true">★</div>
              <h3>{member}</h3>
            </article>
          ))}
        </div>
        <div className="about-team-values">
          <p>Every member of our team:</p>
          <div className="about-team-tags">
            <span>🔍 Researches daily</span>
            <span>💡 Explores new ideas</span>
            <span>🎯 Delivers quality content</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalLine() {
  return (
    <section className="about-final">
      <div className="about-container">
        <SectionTitle icon="🚀">Final Line</SectionTitle>
        <p>“SHARPNER is not just content. It is a movement creating the next generation of storytellers.”</p>
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <main className="about-page">
      <AboutHero />
      <ReasonToStart />
      <FounderInformation />
      <MissionSection />
      <ExperimentalMindset />
      <FutureDream />
      <ContactSection />
      <TeamSection />
      <FinalLine />
    </main>
  )
}

export default AboutPage
