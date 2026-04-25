import { useState, useEffect } from 'react'
import { FiCalendar, FiHome, FiClock, FiX, FiLogIn } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import { supabase } from '../utils/supabase'
import { formatDate, formatINR, bookingRefId } from '../utils/formatting'
import { ROOM_TYPES, APPROVAL_STATUS_LABELS, BOOKING_STATUS_LABELS } from '../utils/constants'
import Modal from '../components/common/Modal'
import { Spinner } from '../components/common/Loading'

export default function MyBookings() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
        fetchBookings(data.session.user.email)
      }
    })
  }, [])

  async function sendOtp() {
    setLoading(true)
    try {
      await api.auth.sendOtp({ email })
      setOtpSent(true)
      toast.success('OTP sent to your email!')
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    try {
      const res = await api.auth.verifyOtp({ email, otp })
      setSession(res.data.session)
      fetchBookings(email)
      toast.success('Logged in!')
    } catch (err) {
      toast.error('Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchBookings(userEmail) {
    setLoading(true)
    try {
      // Find guest by email, then fetch bookings
      const res = await fetch(`/api/bookings/by-email?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()
      setBookings(data.data || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(booking) {
    setCancelling(true)
    try {
      await api.bookings.cancel(booking.id, { reason: 'Cancelled by guest' })
      toast.success('Booking cancelled. Refund initiated.')
      setCancelModal(null)
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, booking_status: 'cancelled' } : b))
    } catch (err) {
      toast.error(err.message || 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  if (!session) {
    return (
      <main className="pt-16 min-h-screen bg-sky-dawn flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-godavari-gradient flex items-center justify-center mx-auto mb-3">
              <FiLogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-2xl text-primary-dark font-bold">My Bookings</h1>
            <p className="text-gray-500 font-body text-sm mt-1">Enter your email to view your bookings</p>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                />
              </div>
              <button onClick={sendOtp} disabled={loading || !email} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" color="white" /> : null}
                Send OTP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 text-sm font-body text-center">OTP sent to {email}</p>
              <div>
                <label className="label">Enter OTP</label>
                <input
                  type="text"
                  className="input-field text-center text-2xl tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button onClick={verifyOtp} disabled={loading || otp.length < 6} className="btn-primary w-full">
                {loading ? <Spinner size="sm" color="white" /> : 'Verify & Login'}
              </button>
              <button onClick={() => setOtpSent(false)} className="btn-ghost w-full text-sm">
                ← Change email
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 min-h-screen bg-sky-dawn">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl text-primary-dark font-bold">My Bookings</h1>
          <button
            onClick={async () => { await supabase.auth.signOut(); setSession(null); setBookings([]) }}
            className="btn-ghost text-sm text-gray-500"
          >
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-heading text-xl text-gray-400 mb-2">No bookings yet</p>
            <p className="text-gray-400 font-body text-sm mb-4">Your bookings will appear here once made.</p>
            <a href="/booking" className="btn-primary">Book a Room</a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-heading text-primary-dark font-semibold">
                        {ROOM_TYPES[booking.room?.room_type]?.label}
                      </span>
                      <span className="text-gray-400 text-sm font-body">#{booking.room?.room_number}</span>
                      <ApprovalBadge status={booking.admin_approval_status} />
                    </div>
                    <p className="text-xs text-gray-400 font-body mb-2">{bookingRefId(booking.id)}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-body flex-wrap">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5 text-river" /> {formatDate(booking.check_in_date)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5 text-river" /> {formatDate(booking.check_out_date)}</span>
                      <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {booking.total_nights} nights</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body font-bold text-primary">{formatINR(booking.total_price)}</p>
                    {booking.booking_status !== 'cancelled' && booking.admin_approval_status === 'pending' && (
                      <button
                        onClick={() => setCancelModal(booking)}
                        className="text-red-500 hover:text-red-700 text-xs font-body mt-2 flex items-center gap-1 ml-auto"
                      >
                        <FiX className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                    {booking.booking_status === 'cancelled' && (
                      <span className="text-red-500 text-xs font-body">Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking">
        <p className="font-body text-gray-600 mb-4">
          Cancel booking <strong>{bookingRefId(cancelModal?.id)}</strong>? A refund will be initiated per our cancellation policy.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setCancelModal(null)} className="btn-outline flex-1">Keep Booking</button>
          <button onClick={() => handleCancel(cancelModal)} disabled={cancelling} className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2">
            {cancelling ? <Spinner size="sm" color="white" /> : null} Confirm Cancel
          </button>
        </div>
      </Modal>
    </main>
  )
}

function ApprovalBadge({ status }) {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }
  return <span className={map[status] || 'badge-pending'}>{APPROVAL_STATUS_LABELS[status]}</span>
}
