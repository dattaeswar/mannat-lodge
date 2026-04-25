import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { LODGE_INFO, CANCELLATION_POLICY } from '../../utils/constants'

export default function Footer() {
  return (
    <footer id="contact" className="bg-primary-dark text-white">
      {/* Wave divider */}
      <div className="h-1 bg-gradient-to-r from-primary via-river to-gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-primary-dark font-heading font-bold text-sm">M</span>
              </div>
              <div>
                <p className="font-heading text-white font-bold text-xl leading-none">MANNAT</p>
                <p className="text-river-mist text-xs font-body">{LODGE_INFO.tagline}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-body leading-relaxed">
              {LODGE_INFO.description}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-gold font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/#rooms">Our Rooms</FooterLink>
              <FooterLink to="/booking">Book Now</FooterLink>
              <FooterLink to="/my-bookings">My Bookings</FooterLink>
              <FooterLink to="/admin">Admin Login</FooterLink>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading text-gold font-semibold mb-4">Policies</h4>
            <ul className="space-y-2 font-body text-sm text-gray-400">
              <li>Check-in: 2:00 PM</li>
              <li>Check-out: 11:00 AM</li>
              <li className="leading-relaxed">{CANCELLATION_POLICY}</li>
              <li>Age requirement: 18+</li>
              <li>Valid ID required at check-in</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-gold font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-2 text-gray-400">
                <FiMapPin className="w-4 h-4 text-river mt-0.5 shrink-0" />
                <span>{LODGE_INFO.address}, {LODGE_INFO.city}, {LODGE_INFO.state} - {LODGE_INFO.pincode}</span>
              </li>
              <li>
                <a href={`tel:${LODGE_INFO.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors">
                  <FiPhone className="w-4 h-4 text-river" />
                  {LODGE_INFO.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${LODGE_INFO.email}`} className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors">
                  <FiMail className="w-4 h-4 text-river" />
                  {LODGE_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs font-body">
            © {new Date().getFullYear()} MANNAT Lodge. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs font-body">
            Payments secured by <span className="text-river-mist">Razorpay</span> · Built with ❤️ on the Godavari
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-gray-400 hover:text-gold transition-colors">
        {children}
      </Link>
    </li>
  )
}
