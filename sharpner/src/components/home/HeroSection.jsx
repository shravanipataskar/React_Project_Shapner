import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-box container-fluid">
        <div className="hero-left">
          <div className="hero-logo">
            <img src="/assets/images/Logo3.png" alt="Sharpner Logo" />
          </div>

          <div className="left-tagline">
            Now, the little ones will speak... <br />
            and the elders will listen.
          </div>

          <div className="social-icons">
            <a href="https://www.youtube.com/@sharpnerWorld" target="_blank" rel="noopener noreferrer" aria-label="Sharpner World on YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/sharpnerworld/" target="_blank" rel="noopener noreferrer" aria-label="Sharpner World on Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>500K+</strong>
              <span>Community</span>
            </div>

            <div>
              <strong>50M+</strong>
              <span>Monthly Reach</span>
            </div>

            <div>
              <strong>Millions</strong>
              <span>Smiles</span>
            </div>
          </div>
        </div>

        <div className="hero-center">
          <img src="/assets/images/Sharpner01.png" alt="Young Sharpner creators" />
        </div>

        <div className="hero-right">
          <div className="top-menu">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/collaborate">Brand Deals</Link>
          </div>

          <div className="right-tagline">
            <img src="/assets/images/try.png" alt="A movement of little ones with big dreams" className="movement-text" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection