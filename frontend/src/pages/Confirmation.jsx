import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiCalendar, FiHome, FiDownload, FiPhone } from 'react-icons/fi'
import { api } from '../utils/api'
import { formatDate, formatINR, bookingRefId } from '../utils/formatting'
import { ROOM_TYPES, CHECK_IN_TIME, CHECK_OUT_TIME, LODGE_INFO } from '../utils/constants'
import { Spinner } from '../components/common/Loading'

export default function Confirmation() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.bookings.get(bookingId)
      .then((res) => setBooking(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) return (
    <main className="pt-16 min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </main>
  )

  return (
    <main className="pt-16 min-h-screen bg-sky-dawn">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-float">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-heading text-3xl text-primary-dark font-bold mb-2">Booking Confirmed!</h1>
          <p className="font-body text-gray-500">Payment received. Your booking is under admin review.</p>
        </div>

        {/* Booking reference */}
        <div className="card p-6 mb-4">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm font-body">Booking Reference</p>
            <p className="font-heading text-3xl font-bold text-primary tracking-wider">
              {booking ? bookingRefId(booking.id) : bookingRefId(bookingId)}
            </p>
          </div>

          {booking ? (
            <div className="space-y-4">
              <InfoRow icon={<FiHome />} label="Room" value={`${ROOM_TYPES[booking.room?.room_type]?.label} (#${booking.room?.room_number})`} />
              <InfoRow icon={<FiCalendar />} label="Check-In" value={`${formatDate(booking.check_in_date)} at ${CHECK_IN_TIME} PM`} />
              <InfoRow icon={<FiCalendar />} label="Check-Out" value={`${formatDate(booking.check_out_date)} at ${CHECK_OUT_TIME} AM`} />
              <InfoRow icon={<FiClock />} label="Nights" value={booking.total_nights} />
              <div className="border-t border-gray-100 pt-4">
                <InfoRow icon={null} label="Amount Paid" value={formatINR(booking.total_price)} valueClass="font-bold text-primary text-lg" />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 font-body text-sm py-4">
              Booking details loading… Check your email for confirmation.
            </div>
          )}
        </div>

        {/* Status card */}
        <div className="card p-5 mb-4 border-l-4 border-green-400">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-body font-semibold text-primary-dark text-sm">Booking Confirmed!</p>
              <p className="text-gray-500 text-sm font-body mt-0.5">
                Payment received and booking is confirmed. A confirmation email has been sent to you.
              </p>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="card p-5 mb-6">
          <h3 className="font-body font-semibold text-primary-dark text-sm mb-3">What to bring at check-in:</h3>
          <ul className="space-y-1.5 font-body text-sm text-gray-600">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Original Government ID (matching your booking)</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Mobile phone for verification</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Booking confirmation email</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/my-bookings" className="btn-primary flex-1 text-center">View My Bookings</Link>
          <a href={`tel:${LODGE_INFO.phone}`} className="btn-outline flex-1 text-center flex items-center justify-center gap-2">
            <FiPhone className="w-4 h-4" /> Contact Lodge
          </a>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-river hover:text-primary font-body text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

function InfoRow({ icon, label, value, valueClass = 'text-primary-dark font-medium' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm font-body">
        {icon && <span className="text-river">{icon}</span>}
        {label}
      </div>
      <span className={`font-body text-sm ${valueClass}`}>{value}</span>
    </div>
  )
}
