import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

function PublicLayout() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'

  return (
    <>
      {!isHomePage && <Header />}
      <main className="site-main">
        <Outlet />
      </main>
      <Footer isHomePage={isHomePage} />
    </>
  )
}

export default PublicLayout
