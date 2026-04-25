import { useState, useEffect } from 'react'
import { FiLogIn, FiGrid, FiList, FiDollarSign, FiHome, FiFileText, FiCheck, FiX, FiEye, FiRefreshCw, FiLogOut, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { api } from '../utils/api'
import { formatDate, formatINR, bookingRefId, formatDateTime } from '../utils/formatting'
import { ROOM_TYPES, APPROVAL_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../utils/constants'
import Modal from '../components/common/Modal'
import { Spinner } from '../components/common/Loading'

export default function Admin() {
  const { admin, loading: authLoading, login, logout, isAuthenticated } = useAdminAuth()
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!isAuthenticated) return <AdminLogin onLogin={login} />
  return <AdminDashboard admin={admin} onLogout={logout} />
}

/* ─── Login ─────────────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch {
      setError('Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-16 min-h-screen bg-primary-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <path fill="white" d="M0,400 Q360,200 720,400 Q1080,600 1440,400 L1440,800 L0,800 Z" />
        </svg>
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center mx-auto mb-3 shadow-gold">
            <span className="font-heading text-primary-dark text-2xl font-bold">M</span>
          </div>
          <h1 className="font-heading text-3xl text-white font-bold">MANNAT Admin</h1>
          <p className="text-river-mist font-body text-sm mt-1">Lodge Management Portal</p>
        </div>
        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <label className="label text-river-mist">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field bg-white/90" placeholder="admin@mannat.com" required />
          </div>
          <div>
            <label className="label text-river-mist">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field bg-white/90" placeholder="••••••••" required />
          </div>
          {error && <p className="text-red-400 text-sm font-body">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" color="white" /> : <FiLogIn className="w-4 h-4" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
function AdminDashboard({ admin, onLogout }) {
  const [tab, setTab] = useState('pending')
  const [stats, setStats] = useState(null)
  const [pendingBookings, setPendingBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [approveModal, setApproveModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => { loadStats(); loadPending() }, [])

  async function loadStats() {
    try { const r = await api.admin.stats(); setStats(r.data) } catch {}
  }
  async function loadPending() {
    setLoading(true)
    try { const r = await api.admin.pendingBookings(); setPendingBookings(r.data || []) } catch {}
    setLoading(false)
  }
  async function loadAll() {
    setLoading(true)
    try { const r = await api.admin.allBookings(); setAllBookings(r.data?.bookings || []) } catch {}
    setLoading(false)
  }
  async function loadPayments() {
    setLoading(true)
    try { const r = await api.admin.payments(); setPayments(r.data || []) } catch {}
    setLoading(false)
  }

  function handleTabChange(t) {
    setTab(t)
    if (t === 'ledger' && allBookings.length === 0) loadAll()
    if (t === 'payments' && payments.length === 0) loadPayments()
  }

  async function handleApprove() {
    try {
      await api.admin.approve(approveModal.id, { adminNotes })
      toast.success('Booking approved! Guest notified.')
      setPendingBookings((p) => p.filter((b) => b.id !== approveModal.id))
      setApproveModal(null); setAdminNotes(''); loadStats()
    } catch (err) { toast.error(err.message || 'Failed to approve') }
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error('Rejection reason required'); return }
    try {
      await api.admin.reject(rejectModal.id, { rejectionReason: rejectReason })
      toast.success('Booking rejected. Refund initiated.')
      setPendingBookings((p) => p.filter((b) => b.id !== rejectModal.id))
      setRejectModal(null); setRejectReason(''); loadStats()
    } catch (err) { toast.error(err.message || 'Failed to reject') }
  }

  const TABS = [
    { key: 'pending', label: 'Pending', icon: <FiClock className="w-4 h-4" />, badge: pendingBookings.length },
    { key: 'ledger', label: 'Guest Ledger', icon: <FiList className="w-4 h-4" /> },
    { key: 'payments', label: 'Payments', icon: <FiDollarSign className="w-4 h-4" /> },
    { key: 'stats', label: 'Dashboard', icon: <FiGrid className="w-4 h-4" /> },
  ]

  return (
    <main className="pt-16 min-h-screen bg-sky-dawn">
      <div className="bg-primary-dark border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="font-heading text-primary-dark font-bold text-xs">{admin?.name?.[0]}</span>
            </div>
            <div>
              <p className="text-white font-body text-sm font-medium">{admin?.name}</p>
              <p className="text-river-mist text-xs font-body capitalize">{admin?.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-river-mist hover:text-white transition-colors font-body text-sm">
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={<FiClock className="w-5 h-5" />} color="text-amber-500" />
            <StatCard label="Total Revenue" value={formatINR(stats.totalRevenue || 0)} icon={<FiDollarSign className="w-5 h-5" />} color="text-green-500" />
            <StatCard label="Total Bookings" value={stats.totalBookings || 0} icon={<FiFileText className="w-5 h-5" />} color="text-primary" />
            <StatCard label="Occupancy Rate" value={`${stats.occupancyRate || 0}%`} icon={<FiHome className="w-5 h-5" />} color="text-river" />
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'
              }`}
            >
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'pending' && <PendingTab bookings={pendingBookings} loading={loading} onApprove={setApproveModal} onReject={setRejectModal} onRefresh={loadPending} />}
        {tab === 'ledger' && <LedgerTab bookings={allBookings} loading={loading} />}
        {tab === 'payments' && <PaymentsTab payments={payments} loading={loading} />}
        {tab === 'stats' && <StatsTab stats={stats} onRefresh={loadStats} />}
      </div>

      <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title="Approve Booking">
        <div className="space-y-4">
          <BookingDetailCard booking={approveModal} />
          <div>
            <label className="label">Admin Notes (optional)</label>
            <textarea className="input-field min-h-[80px] resize-none" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="ID verified, age 25, Aadhaar valid…" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setApproveModal(null)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleApprove} className="flex-[2] bg-green-600 text-white px-6 py-3 rounded-lg font-body font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <FiCheck className="w-4 h-4" /> Approve Booking
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Booking">
        <div className="space-y-4">
          <BookingDetailCard booking={rejectModal} />
          <div>
            <label className="label">Rejection Reason <span className="text-red-500">*</span></label>
            <textarea className="input-field min-h-[80px] resize-none border-red-300" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="ID verification failed / Age below 18…" />
          </div>
          <p className="text-amber-600 text-sm font-body">⚠️ A full refund will be initiated automatically.</p>
          <div className="flex gap-3">
            <button onClick={() => setRejectModal(null)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleReject} className="flex-[2] bg-red-500 text-white px-6 py-3 rounded-lg font-body font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <FiX className="w-4 h-4" /> Reject & Refund
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function PendingTab({ bookings, loading, onApprove, onReject, onRefresh }) {
  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (bookings.length === 0) return (
    <div className="text-center py-16">
      <p className="font-heading text-xl text-gray-400 mb-4">No pending bookings — all caught up!</p>
      <button onClick={onRefresh} className="btn-outline flex items-center gap-1 mx-auto"><FiRefreshCw className="w-4 h-4" /> Refresh</button>
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-body text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} pending review</p>
        <button onClick={onRefresh} className="btn-ghost text-sm flex items-center gap-1"><FiRefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
      {bookings.map((booking) => (
        <div key={booking.id} className="card p-5 border-l-4 border-amber-400">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-heading text-primary-dark font-semibold">{booking.guest?.first_name} {booking.guest?.last_name}</span>
                <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${booking.guest?.age >= 18 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Age: {booking.guest?.age}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-body mb-2">{bookingRefId(booking.id)} · {booking.guest?.email} · +91 {booking.guest?.phone}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 font-body flex-wrap">
                <span>{ROOM_TYPES[booking.room?.room_type]?.label} #{booking.room?.room_number}</span>
                <span>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</span>
                <span className="font-semibold text-primary">{formatINR(booking.total_price)}</span>
              </div>
              <p className="text-xs text-gray-400 font-body mt-1">ID: {booking.guest?.id_type?.toUpperCase()} · {booking.guest?.id_number}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {booking.guest?.id_proof_url && (
                <a href={booking.guest.id_proof_url} target="_blank" rel="noopener noreferrer" className="p-2 text-river hover:text-primary transition-colors" title="View ID proof">
                  <FiEye className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => onApprove(booking)} className="flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-body text-sm font-medium transition-colors">
                <FiCheck className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => onReject(booking)} className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-body text-sm font-medium transition-colors">
                <FiX className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LedgerTab({ bookings, loading }) {
  const [search, setSearch] = useState('')
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase()
    return !q || `${b.guest?.first_name} ${b.guest?.last_name} ${b.guest?.email} ${b.guest?.phone}`.toLowerCase().includes(q)
  })
  return (
    <div className="space-y-4">
      <input className="input-field max-w-xs" placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="overflow-x-auto card">
          <table className="w-full min-w-[600px] font-body text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Reference', 'Guest', 'Room', 'Dates', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400">{bookingRefId(b.id)}</td>
                  <td className="px-4 py-3"><p className="font-medium text-primary-dark">{b.guest?.first_name} {b.guest?.last_name}</p><p className="text-xs text-gray-400">{b.guest?.email}</p></td>
                  <td className="px-4 py-3 text-gray-600">{ROOM_TYPES[b.room?.room_type]?.label}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(b.check_in_date)} – {formatDate(b.check_out_date)}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatINR(b.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={b.admin_approval_status === 'approved' ? 'badge-approved' : b.admin_approval_status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {APPROVAL_STATUS_LABELS[b.admin_approval_status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No bookings found</p>}
        </div>
      )}
    </div>
  )
}

function PaymentsTab({ payments, loading }) {
  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[600px] font-body text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Booking', 'Amount', 'Method', 'Status', 'Date'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs text-gray-400">{bookingRefId(p.booking_id)}</td>
              <td className="px-4 py-3 font-semibold text-primary">{formatINR(p.amount)}</td>
              <td className="px-4 py-3 capitalize text-gray-600">{p.payment_method || '-'}</td>
              <td className="px-4 py-3">
                <span className={p.payment_status === 'successful' ? 'badge-paid' : p.payment_status === 'refunded' ? 'badge-approved' : 'badge-pending'}>
                  {PAYMENT_STATUS_LABELS[p.payment_status] || p.payment_status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDateTime(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && <p className="text-center py-12 text-gray-400">No payment records</p>}
    </div>
  )
}

function StatsTab({ stats, onRefresh }) {
  return (
    <div className="space-y-4">
      <button onClick={onRefresh} className="btn-outline text-sm flex items-center gap-2"><FiRefreshCw className="w-4 h-4" /> Refresh</button>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="card p-5">
              <p className="text-gray-500 text-xs font-body uppercase tracking-wide mb-1">{key.replace(/_/g, ' ')}</p>
              <p className="font-heading text-2xl font-bold text-primary-dark">
                {typeof val === 'number' && key.toLowerCase().includes('revenue') ? formatINR(val) : String(val)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 font-body py-8 text-center">Connect to Supabase to view live stats</p>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-xs font-body uppercase tracking-wide">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className="font-heading text-2xl font-bold text-primary-dark">{value}</p>
    </div>
  )
}

function BookingDetailCard({ booking }) {
  if (!booking) return null
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-sm font-body space-y-2">
      {[
        ['Guest', `${booking.guest?.first_name} ${booking.guest?.last_name}`],
        ['Age', booking.guest?.age, booking.guest?.age >= 18 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'],
        ['ID', `${booking.guest?.id_type?.toUpperCase()} · ${booking.guest?.id_number}`],
        ['Room', `${ROOM_TYPES[booking.room?.room_type]?.label} (#${booking.room?.room_number})`],
        ['Dates', `${formatDate(booking.check_in_date)} → ${formatDate(booking.check_out_date)}`],
        ['Amount', formatINR(booking.total_price), 'font-bold text-primary'],
      ].map(([label, value, cls = 'text-primary-dark font-medium']) => (
        <div key={label} className="flex justify-between">
          <span className="text-gray-500">{label}</span>
          <span className={cls}>{value}</span>
        </div>
      ))}
    </div>
  )
}
