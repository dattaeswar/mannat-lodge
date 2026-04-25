import Hero from '../components/landing/Hero'
import RoomGrid from '../components/landing/RoomGrid'
import { LODGE_INFO } from '../utils/constants'
import { FiMapPin, FiPhone, FiMail, FiShield, FiStar, FiDroplet } from 'react-icons/fi'

export default function Landing() {
  return (
    <main className="pt-16">
      <Hero />

      {/* Features strip */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Feature icon={<FiDroplet className="text-river w-5 h-5" />} title="Godavari View" desc="Panoramic river views from every room" />
          <Feature icon={<FiShield className="text-primary w-5 h-5" />} title="Verified Stays" desc="ID-verified guests, safe environment" />
          <Feature icon={<FiStar className="text-gold w-5 h-5" />} title="Premium Comfort" desc="AC, WiFi, 24/7 hot water in all rooms" />
          <Feature icon={<FiMapPin className="text-stone-bridge w-5 h-5" />} title="Prime Location" desc="Heart of Rajahmundry, easy access" />
        </div>
      </section>

      <RoomGrid />

      {/* About section */}
      <section className="py-20 bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
            <path fill="white" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-river text-sm font-body uppercase tracking-widest mb-2">Our Story</p>
          <h2 className="font-heading text-4xl font-bold text-white mb-4">Born on the Banks of the Godavari</h2>
          <div className="h-0.5 w-24 bg-gold mx-auto mb-6" />
          <p className="font-body text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
            MANNAT — a wish, a dream, a prayer. Nestled where the sacred Godavari meets the sky,
            our lodge was born from a simple desire: to give every guest the feeling of coming home.
            Whether you're here for business, family, or simply to breathe — the river will welcome you.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <Stat value="10+" label="Rooms" />
            <Stat value="500+" label="Happy Guests" />
            <Stat value="4.9★" label="Rating" />
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-16 bg-sky-dawn">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl text-primary-dark font-bold mb-2">Find Us</h2>
          <div className="water-divider w-16 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContactCard icon={<FiMapPin />} title="Address">
              <p>{LODGE_INFO.address}</p>
              <p>{LODGE_INFO.city}, {LODGE_INFO.state}</p>
              <p className="text-gray-400">{LODGE_INFO.pincode}</p>
            </ContactCard>
            <ContactCard icon={<FiPhone />} title="Call Us">
              <a href={`tel:${LODGE_INFO.phone}`} className="hover:text-primary transition-colors">{LODGE_INFO.phone}</a>
              <p className="text-gray-400 text-xs mt-1">Available 24/7</p>
            </ContactCard>
            <ContactCard icon={<FiMail />} title="Email">
              <a href={`mailto:${LODGE_INFO.email}`} className="hover:text-primary transition-colors break-all">{LODGE_INFO.email}</a>
              <p className="text-gray-400 text-xs mt-1">Response within 1 hour</p>
            </ContactCard>
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-sky-godavari flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="font-body font-semibold text-primary-dark text-sm">{title}</p>
        <p className="text-gray-500 text-xs font-body">{desc}</p>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-heading text-3xl font-bold text-gold">{value}</p>
      <p className="font-body text-gray-400 text-sm">{label}</p>
    </div>
  )
}

function ContactCard({ icon, title, children }) {
  return (
    <div className="card p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-godavari-gradient flex items-center justify-center mx-auto mb-3">
        <span className="text-white text-xl">{icon}</span>
      </div>
      <h3 className="font-heading text-primary-dark font-semibold mb-2">{title}</h3>
      <div className="font-body text-gray-600 text-sm space-y-0.5">{children}</div>
    </div>
  )
}
