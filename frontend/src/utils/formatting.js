import { format, parseISO, differenceInDays } from 'date-fns'

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateTime(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function nightsBetween(checkIn, checkOut) {
  const a = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const b = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  return differenceInDays(b, a)
}

export function calcTotalPrice(pricePerNight, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut)
  return nights * pricePerNight
}

export function bookingRefId(id) {
  return id ? `MNT-${id.slice(0, 8).toUpperCase()}` : '-'
}

export function truncate(str, n = 50) {
  return str?.length > n ? `${str.slice(0, n)}…` : str
}
