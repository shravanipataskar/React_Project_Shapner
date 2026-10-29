export const adminNavigationItems = [
  { icon: '▦', label: 'Dashboard', path: '/dashboard' },
  { icon: '▱', label: 'Videos & Shorts', path: '/admin/videos' },
  { icon: '☻', label: 'Auditions', path: '/admin/auditions' },
  { icon: '⊕', label: 'Dhol Pathak', path: '/admin/dhol-pathak' },
  { icon: '☆', label: 'Talent Show', path: '/admin/talent-shows' },
  { icon: 'ⓘ', label: 'Creative Ideas', path: '/admin/ideas' },
  { icon: '♙', label: 'Brand Deals', path: '/admin/collaborations' },
  { icon: '▤', label: 'Tickets', path: '/admin/tickets' },
  { icon: '♧', label: 'Users', path: '/admin/users' },
]

export function isAdminNavigationItemActive(item, pathname) {
  if (item.label === 'Talent Show') {
    return (
      pathname.startsWith('/admin/talent-show') ||
      pathname.startsWith('/admin/talent-shows')
    )
  }

  if (item.label === 'Videos & Shorts' && pathname.startsWith('/videos/create')) {
    return true
  }

  if (
    item.label === 'Creative Ideas' &&
    pathname.startsWith('/admin/creative-ideas')
  ) {
    return true
  }

  if (
    item.label === 'Brand Deals' &&
    pathname.startsWith('/admin/brand-deals')
  ) {
    return true
  }

  return (
    pathname === item.path ||
    (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`))
  )
}
