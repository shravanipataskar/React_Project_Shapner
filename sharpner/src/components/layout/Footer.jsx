import { Link } from 'react-router-dom'

function Footer({ isHomePage }) {
  return (
    <footer className={`footer-section${isHomePage ? ' home-footer' : ''}`}>
      <div className="footer-main">
        <div className="footer-brand">
          <h4>
            <span>Sharpner World</span>
          </h4>
          <p>A Movement Of Little Ones With Big Dreams</p>
        </div>

        <div className="footer-follow">
          <span>Follow Us</span>
          <a href="https://www.youtube.com/@sharpnerWorld" target="_blank" rel="noopener noreferrer" aria-label="Sharpner World on YouTube">
            <i className="fab fa-youtube" aria-hidden="true"></i>
          </a>
          <a href="https://www.instagram.com/sharpnerworld/" target="_blank" rel="noopener noreferrer" aria-label="Sharpner World on Instagram">
            <i className="fab fa-instagram" aria-hidden="true"></i>
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Sharpner World on Facebook">
            <i className="fab fa-facebook-f" aria-hidden="true"></i>
          </a>
        </div>

        <nav className="footer-links" aria-label="Policies">
          <Link to="/legal">Privacy Policy</Link>
          <Link to="/terms-conditions">Terms &amp; Conditions</Link>
          <Link to="/child-safety-policy">Child Safety Policy</Link>
          <Link to="/community-guidelines">Community Guidelines</Link>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Aayojan.AI. All Rights Reserved.</span>
        <span>
          Developed By <a href="https://www.aayojanai.com/" target="_blank" rel="noopener noreferrer">AayojanAI</a>
        </span>
      </div>
    </footer>
  )
}

export default Footer
