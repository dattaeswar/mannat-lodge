import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiLock, FiAlertCircle } from 'react-icons/fi'
import { useRazorpay } from '../../hooks/useRazorpay'
import { api } from '../../utils/api'
import { formatINR } from '../../utils/formatting'
import { Spinner } from '../common/Loading'

export default function Step5Payment({ data, onBack }) {
  const navigate = useNavigate()
  const { pay } = useRazorpay()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePayment() {
    setLoading(true)
    setError('')

    try {
      // 1. Create guest
      const guestRes = await api.guests.create(data.guest)
      const guest = guestRes.data

      // 2. Upload ID proof
      if (data.idProofFile) {
        await api.guests.uploadIdProof(guest.id, data.idProofFile)
      }

      // 3. Create booking
      const bookingRes = await api.bookings.create({
        guestId: guest.id,
        roomId: data.room.id,
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        numberOfGuests: data.guests,
        totalPrice: data.totalPrice,
        guestNotes: data.guestNotes || '',
      })
      const booking = bookingRes.data

      // 4. Razorpay payment
      pay({
        bookingId: booking.id,
        amount: data.totalPrice,
        guest,
        onSuccess: (paymentData) => {
          toast.success('Payment successful!')
          navigate(`/confirmation/${booking.id}`)
        },
        onError: (err) => {
          setError(err.message || 'Payment failed. Try again.')
          setLoading(false)
        },
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-primary-dark font-bold mb-1">Secure Payment</h2>
        <p className="text-gray-500 font-body text-sm">Complete your booking with Razorpay</p>
      </div>

      {/* Payment summary */}
      <div className="bg-godavari-gradient rounded-2xl p-6 text-white text-center">
        <p className="font-body text-river-mist text-sm mb-2">Total Amount to Pay</p>
        <p className="font-heading text-5xl font-bold">{formatINR(data.totalPrice)}</p>
        <p className="text-river-mist text-sm font-body mt-2">{data.nights} night{data.nights > 1 ? 's' : ''} · {data.room?.room_number}</p>
      </div>

      {/* Payment methods info */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="font-body text-sm font-medium text-primary-dark mb-3">Accepted Payment Methods</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
            <div key={method} className="text-center p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-xs font-body text-gray-600 font-medium">{method}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-body">
        <FiLock className="w-4 h-4 text-green-500" />
        256-bit SSL encryption · Secured by Razorpay
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg font-body text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className="btn-outline flex-1">← Back</button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn-gold flex-[2] flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Spinner size="sm" color="white" /> Processing…</>
          ) : (
            <><FiLock className="w-4 h-4" /> Pay {formatINR(data.totalPrice)}</>
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-400 font-body">
        By proceeding, you agree to our terms & cancellation policy. Booking confirmed instantly. Confirmation email sent to {data.guest?.email}.
      </p>
    </div>
  )
}
