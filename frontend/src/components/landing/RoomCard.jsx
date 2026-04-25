import { Link } from 'react-router-dom'
import { FiUsers, FiWifi, FiStar } from 'react-icons/fi'
import { formatINR } from '../../utils/formatting'
import { ROOM_TYPES, AMENITY_ICONS } from '../../utils/constants'

export default function RoomCard({ room, checkIn, checkOut }) {
  const roomTypeInfo = ROOM_TYPES[room.room_type] || {}
  const amenities = Array.isArray(room.amenities) ? room.amenities : []

  const bookingParams = new URLSearchParams({ roomId: room.id })
  if (checkIn) bookingParams.set('checkIn', checkIn)
  if (checkOut) bookingParams.set('checkOut', checkOut)

  return (
    <div className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Room image */}
      <div className="relative h-52 bg-gradient-to-br from-primary to-river overflow-hidden">
        {room.image_url ? (
          <img
            src={room.image_url}
            alt={`Room ${room.room_number}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <RoomPlaceholder roomType={room.room_type} roomNumber={room.room_number} />
        )}

        {/* Room type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${roomTypeInfo.color}`}>
            {roomTypeInfo.label}
          </span>
        </div>

        {/* Room number */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-body font-medium px-2 py-1 rounded-lg">
          #{room.room_number}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-gold text-xs font-body px-2 py-1 rounded-lg">
          <FiStar className="w-3 h-3 fill-current" /> 4.9
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading text-lg text-primary-dark font-semibold">
            {roomTypeInfo.label}
          </h3>
          <div className="text-right">
            <p className="font-body font-bold text-primary text-xl">{formatINR(room.price_per_night)}</p>
            <p className="text-gray-400 text-xs font-body">per night</p>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm font-body mb-3">
          <FiUsers className="w-3.5 h-3.5" />
          Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-gray-500 text-sm font-body mb-3 leading-relaxed line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.slice(0, 4).map((a) => (
              <span key={a} className="inline-flex items-center gap-1 text-xs font-body bg-sky-godavari text-primary px-2 py-0.5 rounded-full">
                {AMENITY_ICONS[a] || <FiWifi className="w-3 h-3" />}
                {a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-xs font-body text-gray-400">+{amenities.length - 4} more</span>
            )}
          </div>
        )}

        {/* Book button */}
        <Link
          to={`/booking?${bookingParams.toString()}`}
          className="btn-primary w-full text-center text-sm block"
        >
          Book This Room
        </Link>
      </div>
    </div>
  )
}

function RoomPlaceholder({ roomType, roomNumber }) {
  const gradients = {
    standard: 'from-primary to-river',
    deluxe: 'from-primary-dark to-primary',
    suite: 'from-stone-bridge to-stone-warm',
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradients[roomType] || gradients.standard} flex flex-col items-center justify-center`}>
      <div className="text-white/20 text-7xl font-heading font-bold">{roomNumber}</div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-16 opacity-30">
          <path d="M0,40 Q100,10 200,40 Q300,70 400,40 L400,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </div>
  )
}
