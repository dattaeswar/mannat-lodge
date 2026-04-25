export const ROOM_TYPES = {
  standard: { label: 'Standard Room', color: 'bg-gray-100 text-gray-800' },
  deluxe: { label: 'Deluxe Room', color: 'bg-blue-100 text-blue-800' },
  suite: { label: 'Suite', color: 'bg-purple-100 text-purple-800' },
}

export const ID_TYPES = [
  { value: 'aadhar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'driving_license', label: 'Driving License' },
]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
]

export const AMENITY_ICONS = {
  'AC': '❄️',
  'WiFi': '📶',
  'TV': '📺',
  'Balcony': '🏞️',
  'Hot water 24/7': '🚿',
  'Room Service': '🛎️',
  'Mini Bar': '🍶',
  'Jacuzzi': '🛁',
  'River View': '🌊',
  'Parking': '🚗',
  'Breakfast': '🍳',
  'Safe': '🔒',
}

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
}

export const APPROVAL_STATUS_LABELS = {
  pending: 'Awaiting Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
}

export const CHECK_IN_TIME = '14:00'
export const CHECK_OUT_TIME = '11:00'
export const MAX_FILE_SIZE_MB = 5
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

export const LODGE_INFO = {
  name: 'MANNAT',
  tagline: 'Your dream home away from home',
  phone: '+91 98765 43210',
  email: 'stay@mannat-lodge.com',
  address: 'River View Road, Rajahmundry',
  city: 'Rajahmundry',
  state: 'Andhra Pradesh',
  pincode: '533101',
  mapUrl: 'https://maps.google.com',
  description: 'Nestled on the banks of the sacred Godavari, MANNAT offers a serene escape with panoramic river views and modern comforts.',
}

export const CANCELLATION_POLICY = 'Free cancellation up to 24 hours before check-in. 50% refund within 24 hours. No refund for no-shows.'
