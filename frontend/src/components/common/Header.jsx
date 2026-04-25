import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiSettings } from 'react-icons/fi'
import { LODGE_INFO } from '../../utils/constants'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <span className="text-primary-dark font-heading font-bold text-sm">M</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-white font-bold text-xl leading-none tracking-wide">MANNAT</p>
              <p className="text-river-mist text-xs font-body">{LODGE_INFO.tagline}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" active={pathname === '/'}>Home</NavLink>
            <NavLink to="/#rooms" active={false}>Rooms</NavLink>
            <NavLink to="/my-bookings" active={pathname === '/my-bookings'}>My Bookings</NavLink>
            <NavLink to="/#contact" active={false}>Contact</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link to="/admin" className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-body text-sm font-medium">
                <FiSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            ) : (
              <Link to="/admin" className="flex items-center gap-2 text-river-mist hover:text-white transition-colors font-body text-sm">
                <FiUser className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <Link to="/booking" className="btn-gold text-sm py-2 px-4 hidden sm:inline-flex">
              Book Now
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 py-4 px-4 space-y-2 animate-fade-in">
          <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
          <MobileNavLink to="/#rooms" onClick={() => setMenuOpen(false)}>Rooms</MobileNavLink>
          <MobileNavLink to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</MobileNavLink>
          <MobileNavLink to="/#contact" onClick={() => setMenuOpen(false)}>Contact</MobileNavLink>
          <Link to="/booking" className="btn-gold w-full text-center block mt-3" onClick={() => setMenuOpen(false)}>
            Book Now
          </Link>
        </div>
      )}
    </header>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`font-body text-sm font-medium transition-colors hover:text-gold ${
        active ? 'text-gold' : 'text-river-mist'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block text-river-mist hover:text-white font-body py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}
