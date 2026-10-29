import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navigation = [
  { label: 'About', to: '/about' },
  { label: 'Collaborate', to: '/collaborate' },
  { label: 'Creative Lab', to: '/creative-lab' },
  { label: 'Gallery', to: '/gallery' },
]

function Header() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isBrandDealsPage = pathname === '/collaborate'
  const isAboutPage = pathname === '/about'
  const isCreativeIdeaPage = pathname === '/submit-idea'
  const isLegalPage = pathname === '/legal' || pathname === '/terms-conditions'
  const isAuditionPage = pathname === '/give-audition'
  const isDholPage = pathname === '/join-dhol-pathak'
  const isPolicyPage =
    pathname === '/child-safety-policy' || pathname === '/community-guidelines'
  const isBrandedHeaderPage =
    isBrandDealsPage ||
    isAboutPage ||
    isCreativeIdeaPage ||
    isLegalPage ||
    isPolicyPage ||
    isAuditionPage ||
    isDholPage

  if (isBrandedHeaderPage) {
    const headerClass = isLegalPage
      ? 'legal-site-header'
      : isAuditionPage
        ? 'brand-deals-header audition-site-header'
        : isDholPage
          ? 'brand-deals-header dhol-site-header'
          : `brand-deals-header${isAboutPage ? ' about-site-header' : ''}`
    const logoClass = isLegalPage ? 'legal-site-logo' : 'brand-deals-logo'
    const menuToggleClass = isLegalPage
      ? 'legal-menu-toggle'
      : 'brand-deals-menu-toggle'
    const navigationId = isLegalPage
      ? 'legal-navigation'
      : 'brand-deals-navigation'

    return (
      <header className={`site-header ${headerClass}`}>
        <Link className={logoClass} to="/" aria-label="Sharpner home">
          <img src="/assets/images/Logo3.png" alt="Sharpner" />
        </Link>
        <button
          className={menuToggleClass}
          type="button"
          aria-expanded={menuOpen}
          aria-controls={navigationId}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={`site-nav${menuOpen ? ' is-open' : ''}`}
          id={navigationId}
          aria-label="Main navigation"
        >
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <Link to="/collaborate" onClick={() => setMenuOpen(false)}>
            Brand Deals
          </Link>
        </nav>
      </header>
    )
  }

  return (
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="Sharpner home">
        sharpner<span>.</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Link className="button button-small" to="/join-community">
        Join us
      </Link>
    </header>
  )
}

export default Header
