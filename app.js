import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'
import nodemailer from 'nodemailer'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.VITE_APP_URL,
  /\.vercel\.app$/,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin)) return cb(null, true)
    cb(null, true) // permissive for now — lock down after deployment confirmed
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID?.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim(),
})

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'mannat-dev-secret'

function verifyAdmin(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'Missing token' } })
    return null
  }
  try { return jwt.verify(auth.slice(7), JWT_SECRET) }
  catch { res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'Invalid token' } }); return null }
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, error: { message: 'Email and password required' } })
  try {
    const { data: admin, error } = await supabase.from('admin_users').select('*').eq('email', email.toLowerCase().trim()).eq('is_active', true).single()
    if (error || !admin) return res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'Invalid credentials' } })
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return res.status(401).json({ success: false, error: { code: 'AUTH_ERROR', message: 'Invalid credentials' } })
    await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', admin.id)
    const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ success: true, data: { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } } })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/auth/admin-logout', (req, res) => res.json({ success: true }))

app.post('/api/auth/guest-otp-send', async (req, res) => {
  try {
    await supabase.auth.admin.generateLink({ type: 'magiclink', email: req.body.email })
    res.json({ success: true, message: 'OTP sent' })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/auth/guest-otp-verify', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email: req.body.email, token: req.body.otp, type: 'email' })
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(401).json({ success: false, error: { message: 'Invalid OTP' } }) }
})

// ── ROOMS ─────────────────────────────────────────────────────────────────────

app.get('/api/rooms', async (req, res) => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').eq('is_active', true).order('room_number')
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/rooms/check-availability', async (req, res) => {
  const { roomId, checkInDate, checkOutDate } = req.body
  try {
    const { data } = await supabase.from('bookings').select('id,check_in_date,check_out_date')
      .eq('room_id', roomId).in('booking_status', ['confirmed', 'checked_in'])
      .lt('check_in_date', checkOutDate).gt('check_out_date', checkInDate)
    const isAvailable = !data || data.length === 0
    res.json({ success: true, data: { isAvailable, conflictingBooking: isAvailable ? null : data[0] } })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/rooms/availability-calendar', (req, res) => res.json({ success: true, data: {} }))

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

// ── GUESTS ────────────────────────────────────────────────────────────────────

app.post('/api/guests', async (req, res) => {
  const { email, phone, first_name, last_name, date_of_birth, id_type, id_number, address, city, state, pincode } = req.body
  const age = Math.floor((Date.now() - new Date(date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
  if (age < 18) return res.status(400).json({ success: false, error: { message: 'Guest must be 18 or older' } })
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, error: { message: 'Invalid Indian mobile number' } })
  try {
    const { data, error } = await supabase.from('guests')
      .upsert({ email, phone, first_name, last_name, date_of_birth, age, id_type, id_number, address, city, state, pincode, updated_at: new Date().toISOString() }, { onConflict: 'email' })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/guests/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('guests').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/guests/:id/upload-id-proof', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ success: false, error: { message: 'No file uploaded' } })
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype))
    return res.status(400).json({ success: false, error: { message: 'Only JPG, PNG, PDF allowed' } })
  try {
    const ext = file.mimetype === 'application/pdf' ? '.pdf' : file.mimetype === 'image/png' ? '.png' : '.jpg'
    const path = `id-proofs/${req.params.id}${ext}`
    const { error: upErr } = await supabase.storage.from('mannat-uploads').upload(path, file.buffer, { contentType: file.mimetype, upsert: true })
    if (upErr) { console.warn('Storage upload skipped:', upErr.message); return res.json({ success: true, data: { id_proof_url: null } }) }
    const { data: urlData } = supabase.storage.from('mannat-uploads').getPublicUrl(path)
    await supabase.from('guests').update({ id_proof_url: urlData.publicUrl, updated_at: new Date().toISOString() }).eq('id', req.params.id)
    res.json({ success: true, data: { id_proof_url: urlData.publicUrl } })
  } catch (err) { console.warn('Upload non-fatal:', err.message); res.json({ success: true, data: { id_proof_url: null } }) }
})

// ── BOOKINGS ──────────────────────────────────────────────────────────────────

app.post('/api/bookings', async (req, res) => {
  const { guestId, roomId, checkInDate, checkOutDate, numberOfGuests, totalPrice, guestNotes } = req.body
  if (!guestId || !roomId || !checkInDate || !checkOutDate)
    return res.status(400).json({ success: false, error: { message: 'Missing required fields' } })
  try {
    const { data: conflicts } = await supabase.from('bookings').select('id')
      .eq('room_id', roomId).in('booking_status', ['confirmed', 'checked_in'])
      .lt('check_in_date', checkOutDate).gt('check_out_date', checkInDate)
    if (conflicts?.length > 0) return res.status(409).json({ success: false, error: { message: 'Room not available for selected dates' } })
    const { data, error } = await supabase.from('bookings').insert({
      guest_id: guestId, room_id: roomId, check_in_date: checkInDate, check_out_date: checkOutDate,
      number_of_guests: numberOfGuests, total_price: totalPrice, guest_notes: guestNotes || null,
      booking_status: 'pending', payment_status: 'unpaid', admin_approval_status: 'pending',
    }).select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/bookings/by-email', async (req, res) => {
  try {
    const { data: guest } = await supabase.from('guests').select('id').eq('email', req.query.email).single()
    if (!guest) return res.json({ success: true, data: [] })
    const { data, error } = await supabase.from('bookings')
      .select('*, room:rooms(id,room_number,room_type,price_per_night)')
      .eq('guest_id', guest.id).order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/bookings/guest/:guestId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings')
      .select('*, room:rooms(id,room_number,room_type)').eq('guest_id', req.params.guestId).order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*, guest:guests(*), room:rooms(*)').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings')
      .update({ booking_status: 'cancelled', payment_status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

// ── PAYMENTS ──────────────────────────────────────────────────────────────────

app.post('/api/payments/create-order', async (req, res) => {
  const { bookingId, amount } = req.body
  if (!bookingId || !amount) return res.status(400).json({ success: false, error: { message: 'bookingId and amount required' } })
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), currency: 'INR',
      receipt: bookingId.slice(0, 40), notes: { bookingId }, payment_capture: 1,
    })
    await supabase.from('payments').insert({ booking_id: bookingId, razorpay_order_id: order.id, amount, payment_status: 'pending' })
    res.json({ success: true, data: { razorpayOrderId: order.id, amount, currency: 'INR' } })
  } catch (err) { res.status(500).json({ success: false, error: { code: 'PAYMENT_ERROR', message: err.message } }) }
})

app.post('/api/payments/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET?.trim())
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`)
  if (hmac.digest('hex') !== razorpaySignature)
    return res.status(400).json({ success: false, error: { message: 'Payment signature verification failed' } })
  try {
    await supabase.from('payments').update({ razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, payment_status: 'successful', updated_at: new Date().toISOString() }).eq('razorpay_order_id', razorpayOrderId)
    await supabase.from('bookings').update({ payment_status: 'paid', booking_status: 'confirmed', admin_approval_status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', bookingId)
    await supabase.from('audit_logs').insert({ action: 'payment_received', entity_type: 'booking', entity_id: bookingId })
    sendBookingEmail(bookingId).catch(console.error)
    res.json({ success: true, data: { bookingId, message: 'Payment verified. Booking confirmed!' } })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/payments/booking/:bookingId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payments').select('*').eq('booking_id', req.params.bookingId).single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────

app.get('/api/admin/dashboard-stats', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const [{ count: pendingApprovals }, { count: totalBookings }, paymentsRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('admin_approval_status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('payment_status', 'successful'),
    ])
    const totalRevenue = (paymentsRes.data || []).reduce((s, p) => s + Number(p.amount), 0)
    res.json({ success: true, data: { pendingApprovals, totalBookings, totalRevenue, occupancyRate: 0 } })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/admin/bookings/pending', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const { data, error } = await supabase.from('bookings')
      .select('*, guest:guests(*), room:rooms(id,room_number,room_type,price_per_night,capacity)')
      .eq('admin_approval_status', 'pending').eq('payment_status', 'paid').order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/admin/bookings', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const { data, error } = await supabase.from('bookings')
      .select('*, guest:guests(id,first_name,last_name,email,phone), room:rooms(id,room_number,room_type)')
      .order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    res.json({ success: true, data: { bookings: data, total: data.length } })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/admin/bookings/:id/approve', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const { data, error } = await supabase.from('bookings')
      .update({ admin_approval_status: 'approved', booking_status: 'confirmed', admin_notes: req.body.adminNotes || null, approved_at: new Date().toISOString(), approved_by_admin_id: decoded.adminId, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select('*, guest:guests(email,first_name)').single()
    if (error) throw error
    await supabase.from('audit_logs').insert({ admin_id: decoded.adminId, action: 'approved_booking', entity_type: 'booking', entity_id: req.params.id })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/admin/bookings/:id/reject', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  const { rejectionReason } = req.body
  if (!rejectionReason?.trim()) return res.status(400).json({ success: false, error: { message: 'Rejection reason required' } })
  try {
    const { data, error } = await supabase.from('bookings')
      .update({ admin_approval_status: 'rejected', booking_status: 'cancelled', payment_status: 'refunded', rejection_reason: rejectionReason, rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select('*, guest:guests(email,first_name)').single()
    if (error) throw error
    await supabase.from('audit_logs').insert({ admin_id: decoded.adminId, action: 'rejected_booking', entity_type: 'booking', entity_id: req.params.id, details: { rejectionReason } })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/admin/payments', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.get('/api/admin/audit-logs', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.post('/api/admin/rooms', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  const { roomNumber, roomType, floorNumber, capacity, pricePerNight, amenities, description } = req.body
  try {
    const { data, error } = await supabase.from('rooms').insert({ room_number: roomNumber, room_type: roomType, floor_number: floorNumber, capacity, price_per_night: pricePerNight, amenities: amenities || [], description: description || '' }).select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

app.put('/api/admin/rooms/:id', async (req, res) => {
  const decoded = verifyAdmin(req, res); if (!decoded) return
  const { roomNumber, roomType, floorNumber, capacity, pricePerNight, amenities, description, isActive } = req.body
  try {
    const { data, error } = await supabase.from('rooms').update({ room_number: roomNumber, room_type: roomType, floor_number: floorNumber, capacity, price_per_night: pricePerNight, amenities: amenities || [], description: description || '', is_active: isActive, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: { message: err.message } }) }
})

// ── EMAIL ─────────────────────────────────────────────────────────────────────

function mailer() {
  return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } })
}

async function getBooking(id) {
  const { data } = await supabase.from('bookings').select('*, guest:guests(*), room:rooms(*)').eq('id', id).single()
  return data
}

async function sendBookingEmail(bookingId) {
  const b = await getBooking(bookingId)
  if (!b?.guest?.email) return
  const ref = `MNT-${bookingId.slice(0, 8).toUpperCase()}`
  await mailer().sendMail({
    from: `"MANNAT Lodge" <${process.env.GMAIL_USER}>`,
    to: b.guest.email,
    subject: `Booking Confirmed! ${ref} | MANNAT Lodge`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><div style="background:#1a4a6b;padding:24px;text-align:center"><h1 style="color:#d4af37;margin:0">MANNAT Lodge</h1><p style="color:#b8d4e8;margin:4px 0 0">Your dream home away from home</p></div><div style="padding:24px"><h2 style="color:#1a4a6b">Booking Confirmed! ✅</h2><p>Hello <strong>${b.guest.first_name}</strong>, your booking is confirmed.</p><table style="width:100%;border-collapse:collapse;margin:16px 0"><tr style="background:#f0f7fb"><td style="padding:10px;color:#666">Reference</td><td style="padding:10px;font-weight:bold;color:#1a4a6b">${ref}</td></tr><tr><td style="padding:10px;color:#666">Room</td><td style="padding:10px">${b.room?.room_type} #${b.room?.room_number}</td></tr><tr style="background:#f0f7fb"><td style="padding:10px;color:#666">Check-In</td><td style="padding:10px">${b.check_in_date} at 2:00 PM</td></tr><tr><td style="padding:10px;color:#666">Check-Out</td><td style="padding:10px">${b.check_out_date} at 11:00 AM</td></tr><tr style="background:#f0f7fb"><td style="padding:10px;color:#666">Amount Paid</td><td style="padding:10px;font-weight:bold;color:#1a4a6b">₹${Number(b.total_price).toLocaleString('en-IN')}</td></tr></table><p>Contact: +91 98765 43210 | stay@mannat-lodge.com</p></div></div>`,
  })
}

// ── 404 JSON fallback ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` } })
})

export default app
