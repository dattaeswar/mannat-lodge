import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addDays, format, parseISO } from 'date-fns'
import { FiCalendar, FiUsers, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { formatINR, nightsBetween, calcTotalPrice } from '../../utils/formatting'
import { ROOM_TYPES, AMENITY_ICONS } from '../../utils/constants'
import { api } from '../../utils/api'
import { Spinner } from '../common/Loading'

export default function Step1RoomSelection({ data, onChange, onNext }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState(data.checkIn ? parseISO(data.checkIn) : null)
  const [checkOut, setCheckOut] = useState(data.checkOut ? parseISO(data.checkOut) : null)
  const [selectedRoom, setSelectedRoom] = useState(data.room || null)
  const [guests, setGuests] = useState(data.guests || 1)
  const [availability, setAvailability] = useState({})
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.rooms.list()
      .then((res) => setRooms(res.data || FALLBACK_ROOMS))
      .catch(() => setRooms(FALLBACK_ROOMS))
      .finally(() => setLoading(false))
  }, [])

  async function checkRoomAvailability(room) {
    if (!checkIn || !checkOut) {
      setError('Select check-in and check-out dates first')
      return
    }
    setChecking(true)
    setError('')
    try {
      const res = await api.rooms.checkAvailability({
        roomId: room.id,
        checkInDate: format(checkIn, 'yyyy-MM-dd'),
        checkOutDate: format(checkOut, 'yyyy-MM-dd'),
      })
      setAvailability((prev) => ({ ...prev, [room.id]: res.data.isAvailable }))
    } catch {
      setAvailability((prev) => ({ ...prev, [room.id]: true }))
    } finally {
      setChecking(false)
    }
  }

  function handleSelectRoom(room) {
    if (guests > room.capacity) {
      setError(`This room fits max ${room.capacity} guests`)
      return
    }
    setSelectedRoom(room)
    setError('')
    checkRoomAvailability(room)
  }

  function handleNext() {
    if (!checkIn || !checkOut) return setError('Select both dates')
    if (!selectedRoom) return setError('Select a room')
    if (guests > selectedRoom.capacity) return setError(`Room fits max ${selectedRoom.capacity} guests`)
    if (availability[selectedRoom.id] === false) return setError('Room not available for selected dates')

    const nights = nightsBetween(checkIn, checkOut)
    const totalPrice = calcTotalPrice(selectedRoom.price_per_night, checkIn, checkOut)
    onChange({
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      room: selectedRoom,
      guests,
      nights,
      totalPrice,
    })
    onNext()
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-primary-dark font-bold mb-1">Select Your Room</h2>
        <p className="text-gray-500 font-body text-sm">Choose dates and pick your perfect riverside retreat</p>
      </div>

      {/* Date + guest row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-sky-godavari rounded-xl">
        <div>
          <label className="label">Check-In</label>
          <DatePicker
            selected={checkIn}
            onChange={(d) => { setCheckIn(d); if (checkOut && d >= checkOut) setCheckOut(addDays(d, 1)) }}
            minDate={new Date()}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Check-Out</label>
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="input-field"
          />
        </div>
        <div>
          <label className="label flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="input-field"
          >
            {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} guest{n>1?'s':''}</option>)}
          </select>
        </div>
      </div>

      {nights > 0 && (
        <div className="text-center font-body text-sm text-primary font-medium">
          {nights} night{nights > 1 ? 's' : ''} selected
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg font-body text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Room list */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {rooms
            .filter((r) => r.capacity >= guests && r.is_active !== false)
            .map((room) => {
              const isSelected = selectedRoom?.id === room.id
              const avail = availability[room.id]
              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-sky-godavari shadow-river'
                      : avail === false
                      ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-river hover:bg-sky-dawn'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-body font-semibold text-primary-dark">
                            {ROOM_TYPES[room.room_type]?.label}
                          </span>
                          <span className="text-gray-400 font-body text-sm">#{room.room_number}</span>
                          {avail === false && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Not Available</span>
                          )}
                          {avail === true && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Available</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 text-xs font-body">
                          <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> up to {room.capacity}</span>
                          {(Array.isArray(room.amenities) ? room.amenities : []).slice(0, 3).map((a) => (
                            <span key={a}>{AMENITY_ICONS[a]} {a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-body font-bold text-primary text-lg">{formatINR(room.price_per_night)}</p>
                      <p className="text-gray-400 text-xs font-body">/night</p>
                      {nights > 0 && (
                        <p className="text-primary-dark text-xs font-body font-medium mt-0.5">
                          {formatINR(room.price_per_night * nights)} total
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      <button onClick={handleNext} disabled={!selectedRoom || !checkIn || !checkOut} className="btn-primary w-full">
        Continue to Guest Details →
      </button>
    </div>
  )
}

const FALLBACK_ROOMS = [
  { id: '1', room_number: '101', room_type: 'standard', capacity: 2, price_per_night: 2500, amenities: ['AC', 'WiFi', 'TV'], is_active: true },
  { id: '2', room_number: '102', room_type: 'standard', capacity: 2, price_per_night: 2500, amenities: ['AC', 'WiFi', 'TV'], is_active: true },
  { id: '3', room_number: '201', room_type: 'deluxe', capacity: 3, price_per_night: 4500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'River View'], is_active: true },
  { id: '4', room_number: '202', room_type: 'deluxe', capacity: 2, price_per_night: 5000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Mini Bar'], is_active: true },
  { id: '5', room_number: '301', room_type: 'suite', capacity: 2, price_per_night: 8500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Jacuzzi', 'River View'], is_active: true },
  { id: '6', room_number: '302', room_type: 'suite', capacity: 4, price_per_night: 10000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Jacuzzi', 'River View', 'Breakfast'], is_active: true },
]
