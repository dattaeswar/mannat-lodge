import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoomCard from './RoomCard'
import { SkeletonCard } from '../common/Loading'
import { api } from '../../utils/api'
import { ROOM_TYPES } from '../../utils/constants'

export default function RoomGrid() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchParams] = useSearchParams()

  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')

  useEffect(() => {
    api.rooms.list()
      .then((res) => setRooms(res.data || []))
      .catch(() => setRooms(SAMPLE_ROOMS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.room_type === filter)

  return (
    <section id="rooms" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="font-body text-river text-sm font-medium tracking-widest uppercase mb-2">Our Rooms</p>
        <h2 className="section-title mb-3">Comfort on the Godavari</h2>
        <div className="water-divider w-24 mx-auto mb-4" />
        <p className="section-subtitle max-w-xl mx-auto">
          Ten thoughtfully designed rooms, each offering a unique experience of riverside living.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {[{ key: 'all', label: 'All Rooms' }, ...Object.entries(ROOM_TYPES).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all ${
              filter === key
                ? 'bg-primary text-white shadow-river'
                : 'bg-gray-100 text-gray-600 hover:bg-sky-godavari hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-body">No rooms found for this type.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} />
          ))}
        </div>
      )}
    </section>
  )
}

// Fallback sample data when API not connected
const SAMPLE_ROOMS = [
  { id: '1', room_number: '101', room_type: 'standard', capacity: 2, price_per_night: 2500, amenities: ['AC', 'WiFi', 'TV', 'Hot water 24/7'], description: 'A cozy standard room with river breeze and modern amenities for a comfortable stay.' },
  { id: '2', room_number: '102', room_type: 'standard', capacity: 2, price_per_night: 2500, amenities: ['AC', 'WiFi', 'TV', 'Hot water 24/7'], description: 'Clean and comfortable standard room perfect for business travelers.' },
  { id: '3', room_number: '103', room_type: 'standard', capacity: 3, price_per_night: 3000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7'], description: 'Standard room with private balcony overlooking the garden.' },
  { id: '4', room_number: '201', room_type: 'deluxe', capacity: 2, price_per_night: 4500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service'], description: 'Spacious deluxe room with river view balcony and premium furnishings.' },
  { id: '5', room_number: '202', room_type: 'deluxe', capacity: 3, price_per_night: 5000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service', 'Mini Bar'], description: 'Premium deluxe room with panoramic Godavari views and mini bar.' },
  { id: '6', room_number: '203', room_type: 'deluxe', capacity: 2, price_per_night: 4500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service'], description: 'Elegant deluxe room with heritage décor and river-facing balcony.' },
  { id: '7', room_number: '204', room_type: 'deluxe', capacity: 4, price_per_night: 5500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service', 'Mini Bar'], description: 'Family deluxe room with extra space and connected balcony.' },
  { id: '8', room_number: '301', room_type: 'suite', capacity: 2, price_per_night: 8500, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service', 'Mini Bar', 'Jacuzzi', 'River View'], description: 'Luxury suite with jacuzzi, king-size bed, and full Godavari river panorama.' },
  { id: '9', room_number: '302', room_type: 'suite', capacity: 4, price_per_night: 10000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service', 'Mini Bar', 'Jacuzzi', 'River View', 'Breakfast'], description: 'Presidential suite with separate living area, dining space, and 180° river views.' },
  { id: '10', room_number: '303', room_type: 'suite', capacity: 6, price_per_night: 12000, amenities: ['AC', 'WiFi', 'TV', 'Balcony', 'Hot water 24/7', 'Room Service', 'Mini Bar', 'Jacuzzi', 'River View', 'Breakfast', 'Parking'], description: 'Grand family suite with three bedrooms, full kitchen, and exclusive Godavari terrace.' },
]
