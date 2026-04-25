import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addDays, format } from 'date-fns'
import { FiCalendar, FiSearch, FiMapPin } from 'react-icons/fi'
import { LODGE_INFO } from '../../utils/constants'

export default function Hero() {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState(null)
  const [checkOut, setCheckOut] = useState(null)

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'))
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'))
    navigate(`/booking?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Godavari background */}
      <div className="absolute inset-0 bg-godavari-gradient" />

      {/* Bridge silhouette SVG overlay */}
      <BridgeSilhouette />

      {/* Floating particles (river ripples) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-river/20 animate-ripple"
            style={{
              width: `${80 + i * 40}px`,
              height: `${20 + i * 10}px`,
              bottom: `${15 + i * 5}%`,
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
        {/* Location badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-river-mist text-sm font-body px-4 py-2 rounded-full mb-6">
          <FiMapPin className="w-3.5 h-3.5 text-gold" />
          {LODGE_INFO.city}, {LODGE_INFO.state} · On the banks of the Godavari
        </div>

        {/* Main heading */}
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white font-bold leading-tight mb-4">
          MANNAT
        </h1>
        <div className="h-0.5 w-24 bg-gold mx-auto mb-4" />
        <p className="font-heading text-xl sm:text-2xl text-gold italic mb-4">
          "{LODGE_INFO.tagline}"
        </p>
        <p className="font-body text-river-mist text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Wake up to the gentle flow of the Godavari. Ten curated rooms where heritage meets comfort,
          where the river's song becomes your morning alarm.
        </p>

        {/* Availability search card */}
        <form
          onSubmit={handleSearch}
          className="glass rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto shadow-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="text-left">
              <label className="block text-river-mist text-xs font-body font-medium mb-1.5 flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" /> CHECK-IN
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(d) => {
                  setCheckIn(d)
                  if (checkOut && d >= checkOut) setCheckOut(addDays(d, 1))
                }}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                placeholderText="Select date"
                dateFormat="dd MMM yyyy"
                className="w-full bg-white/90 text-primary-dark placeholder:text-gray-400 px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="text-left">
              <label className="block text-river-mist text-xs font-body font-medium mb-1.5 flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" /> CHECK-OUT
              </label>
              <DatePicker
                selected={checkOut}
                onChange={setCheckOut}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                placeholderText="Select date"
                dateFormat="dd MMM yyyy"
                className="w-full bg-white/90 text-primary-dark placeholder:text-gray-400 px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
          <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 text-base">
            <FiSearch className="w-4 h-4" />
            Check Availability
          </button>
        </form>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mt-10 text-white/80 font-body text-sm">
          <Stat value="10" label="Rooms" />
          <div className="h-8 w-px bg-white/20" />
          <Stat value="3" label="Room Types" />
          <div className="h-8 w-px bg-white/20" />
          <Stat value="★ 4.9" label="Rating" />
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-8 h-8 border-2 border-white/40 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-heading text-2xl font-bold text-gold">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function BridgeSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full opacity-20 pointer-events-none"
      viewBox="0 0 1440 300"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Water */}
      <rect x="0" y="200" width="1440" height="100" fill="#4a90a4" opacity="0.5" />
      {/* Bridge pillars */}
      {[100, 280, 460, 640, 820, 1000, 1180, 1360].map((x, i) => (
        <rect key={i} x={x} y={80} width={20} height={200} fill="#6b5e4a" rx="2" />
      ))}
      {/* Bridge deck */}
      <rect x="80" y="75" width="1280" height="18" fill="#8b7355" rx="4" />
      {/* Arch spans */}
      {[100, 280, 460, 640, 820, 1000, 1180].map((x, i) => (
        <path
          key={i}
          d={`M ${x + 20} 93 Q ${x + 110} 30 ${x + 200} 93`}
          stroke="#6b5e4a"
          strokeWidth="8"
          fill="none"
        />
      ))}
      {/* Boats */}
      <ellipse cx="200" cy="215" rx="35" ry="8" fill="#2d6a4f" />
      <ellipse cx="600" cy="220" rx="30" ry="7" fill="#3d8b6e" />
      <ellipse cx="1100" cy="212" rx="38" ry="9" fill="#2d6a4f" />
      <ellipse cx="900" cy="218" rx="25" ry="6" fill="#c9a96e" />
    </svg>
  )
}
