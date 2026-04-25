import { FiCalendar, FiUser, FiHome, FiClock, FiInfo } from 'react-icons/fi'
import { formatINR, formatDate, bookingRefId } from '../../utils/formatting'
import { ROOM_TYPES, ID_TYPES, CANCELLATION_POLICY, CHECK_IN_TIME, CHECK_OUT_TIME } from '../../utils/constants'

export default function Step4Review({ data, onNext, onBack }) {
  const { room, checkIn, checkOut, nights, totalPrice, guests, guest, idProofPreview } = data
  const idTypeLabel = ID_TYPES.find((t) => t.value === guest?.id_type)?.label || guest?.id_type

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-primary-dark font-bold mb-1">Review Booking</h2>
        <p className="text-gray-500 font-body text-sm">Verify all details before proceeding to payment</p>
      </div>

      {/* Booking summary card */}
      <div className="bg-godavari-gradient rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-heading text-2xl font-bold">{ROOM_TYPES[room?.room_type]?.label}</p>
            <p className="text-river-mist text-sm font-body">Room #{room?.room_number}</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-3xl font-bold">{formatINR(totalPrice)}</p>
            <p className="text-river-mist text-sm font-body">{nights} night{nights > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
          <div>
            <p className="text-white/60 text-xs font-body uppercase tracking-wide">Check-In</p>
            <p className="font-body font-semibold">{formatDate(checkIn)}</p>
            <p className="text-river-mist text-xs font-body">{CHECK_IN_TIME} PM</p>
          </div>
          <div>
            <p className="text-white/60 text-xs font-body uppercase tracking-wide">Check-Out</p>
            <p className="font-body font-semibold">{formatDate(checkOut)}</p>
            <p className="text-river-mist text-xs font-body">{CHECK_OUT_TIME} AM</p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="font-body font-semibold text-primary-dark text-sm mb-3">Price Breakdown</h3>
        <div className="space-y-2 text-sm font-body">
          <Row label={`${formatINR(room?.price_per_night)} × ${nights} nights`} value={formatINR(totalPrice)} />
          <Row label="Taxes & fees" value="Included" valueClass="text-green-600" />
          <div className="border-t border-gray-200 pt-2 mt-2">
            <Row label="Total Amount" value={formatINR(totalPrice)} labelClass="font-bold text-primary-dark" valueClass="font-bold text-primary text-base" />
          </div>
        </div>
      </div>

      {/* Guest details */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="font-body font-semibold text-primary-dark text-sm mb-3 flex items-center gap-2">
          <FiUser className="w-4 h-4 text-river" /> Guest Information
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-body">
          <InfoRow label="Name" value={`${guest?.first_name} ${guest?.last_name}`} />
          <InfoRow label="Email" value={guest?.email} />
          <InfoRow label="Phone" value={`+91 ${guest?.phone}`} />
          <InfoRow label="Guests" value={guests} />
          <InfoRow label={idTypeLabel} value={guest?.id_number} />
          <InfoRow label="Address" value={`${guest?.city}, ${guest?.state} - ${guest?.pincode}`} />
        </div>
      </div>

      {/* ID proof preview */}
      {idProofPreview && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="font-body font-semibold text-primary-dark text-sm mb-3">ID Proof Preview</h3>
          <img src={idProofPreview} alt="ID proof" className="max-h-32 rounded-lg object-contain border border-gray-200" />
        </div>
      )}

      {/* Policies */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <FiInfo className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm font-body text-amber-800">
          <p className="font-semibold mb-1">Cancellation Policy</p>
          <p>{CANCELLATION_POLICY}</p>
          <p className="mt-2 text-amber-700">Booking confirmation is subject to admin verification of ID and age (18+).</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">← Back</button>
        <button onClick={onNext} className="btn-gold flex-[2]">Proceed to Payment ({formatINR(totalPrice)}) →</button>
      </div>
    </div>
  )
}

function Row({ label, value, labelClass = 'text-gray-600', valueClass = 'text-primary-dark font-medium' }) {
  return (
    <div className="flex justify-between items-center">
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-primary-dark font-medium">{value || '-'}</span>
    </>
  )
}
