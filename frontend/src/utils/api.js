const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('mannat_admin_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Request failed')
    err.code = data?.error?.code
    err.details = data?.error?.details
    err.status = res.status
    throw err
  }
  return data
}

// Rooms
export const api = {
  rooms: {
    list: () => request('/rooms'),
    get: (id) => request(`/rooms/${id}`),
    checkAvailability: (body) => request('/rooms/check-availability', { method: 'POST', body: JSON.stringify(body) }),
    calendar: (month) => request(`/rooms/availability-calendar${month ? `?month=${month}` : ''}`),
  },

  guests: {
    create: (body) => request('/guests', { method: 'POST', body: JSON.stringify(body) }),
    get: (id) => request(`/guests/${id}`),
    update: (id, body) => request(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    uploadIdProof: (id, file) => {
      const form = new FormData()
      form.append('file', file)
      const token = localStorage.getItem('mannat_admin_token')
      return fetch(`${BASE}/guests/${id}/upload-id-proof`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then((r) => r.json())
    },
  },

  bookings: {
    create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
    get: (id) => request(`/bookings/${id}`),
    byGuest: (guestId) => request(`/bookings/guest/${guestId}`),
    cancel: (id, body) => request(`/bookings/${id}/cancel`, { method: 'PUT', body: JSON.stringify(body) }),
  },

  payments: {
    createOrder: (body) => request('/payments/create-order', { method: 'POST', body: JSON.stringify(body) }),
    verify: (body) => request('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
    byBooking: (bookingId) => request(`/payments/booking/${bookingId}`),
  },

  auth: {
    sendOtp: (body) => request('/auth/guest-otp-send', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body) => request('/auth/guest-otp-verify', { method: 'POST', body: JSON.stringify(body) }),
    adminLogin: (body) => request('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) }),
    adminLogout: () => request('/auth/admin-logout', { method: 'POST' }),
  },

  admin: {
    stats: () => request('/admin/dashboard-stats'),
    pendingBookings: () => request('/admin/bookings/pending'),
    allBookings: (params = '') => request(`/admin/bookings${params}`),
    approve: (id, body) => request(`/admin/bookings/${id}/approve`, { method: 'POST', body: JSON.stringify(body) }),
    reject: (id, body) => request(`/admin/bookings/${id}/reject`, { method: 'POST', body: JSON.stringify(body) }),
    payments: (params = '') => request(`/admin/payments${params}`),
    auditLogs: () => request('/admin/audit-logs'),
    createRoom: (body) => request('/admin/rooms', { method: 'POST', body: JSON.stringify(body) }),
    updateRoom: (id, body) => request(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
}
