import { useState } from 'react'
import { format, subYears } from 'date-fns'
import DatePicker from 'react-datepicker'
import { FiAlertCircle, FiUser } from 'react-icons/fi'
import { validateGuestForm, calculateAge } from '../../utils/validation'
import { ID_TYPES, INDIAN_STATES } from '../../utils/constants'

export default function Step2GuestForm({ data, onChange, onNext, onBack }) {
  const [form, setForm] = useState({
    first_name: data.guest?.first_name || '',
    last_name: data.guest?.last_name || '',
    email: data.guest?.email || '',
    phone: data.guest?.phone || '',
    date_of_birth: data.guest?.date_of_birth || '',
    id_type: data.guest?.id_type || '',
    id_number: data.guest?.id_number || '',
    address: data.guest?.address || '',
    city: data.guest?.city || '',
    state: data.guest?.state || 'Andhra Pradesh',
    pincode: data.guest?.pincode || '',
  })
  const [errors, setErrors] = useState({})
  const [dob, setDob] = useState(data.guest?.date_of_birth ? new Date(data.guest.date_of_birth) : null)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
  }

  function handleDobChange(date) {
    setDob(date)
    set('date_of_birth', date ? format(date, 'yyyy-MM-dd') : '')
  }

  function handleNext() {
    const errs = validateGuestForm(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onChange({ guest: form })
    onNext()
  }

  const age = dob ? calculateAge(dob) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-primary-dark font-bold mb-1">Guest Details</h2>
        <p className="text-gray-500 font-body text-sm">All fields required. Must be 18+ to book.</p>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" icon={<FiUser />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" error={errors.first_name}>
            <input className={`input-field ${errors.first_name ? 'input-error' : ''}`} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="Rahul" />
          </Field>
          <Field label="Last Name" error={errors.last_name}>
            <input className={`input-field ${errors.last_name ? 'input-error' : ''}`} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Sharma" />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="rahul@example.com" />
          </Field>
          <Field label="Mobile Number" error={errors.phone}>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 text-sm font-body">+91</span>
              <input
                type="tel"
                className={`input-field rounded-l-none ${errors.phone ? 'input-error' : ''}`}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
              />
            </div>
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth}>
            <div className="relative">
              <DatePicker
                selected={dob}
                onChange={handleDobChange}
                maxDate={subYears(new Date(), 18)}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                dateFormat="dd MMM yyyy"
                placeholderText="DD MMM YYYY"
                className={`input-field w-full ${errors.date_of_birth ? 'input-error' : ''}`}
              />
              {age !== null && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-body font-semibold px-2 py-0.5 rounded-full ${age >= 18 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Age: {age}
                </span>
              )}
            </div>
          </Field>
        </div>
      </Section>

      {/* ID Details */}
      <Section title="Identity Verification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ID Type" error={errors.id_type}>
            <select className={`input-field ${errors.id_type ? 'input-error' : ''}`} value={form.id_type} onChange={(e) => set('id_type', e.target.value)}>
              <option value="">Select ID type</option>
              {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="ID Number" error={errors.id_number}>
            <input className={`input-field ${errors.id_number ? 'input-error' : ''}`} value={form.id_number} onChange={(e) => set('id_number', e.target.value.toUpperCase())} placeholder="Enter ID number" />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section title="Address">
        <div className="space-y-4">
          <Field label="Street Address" error={errors.address}>
            <input className={`input-field ${errors.address ? 'input-error' : ''}`} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Flat/House No, Street, Area" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" error={errors.city}>
              <input className={`input-field ${errors.city ? 'input-error' : ''}`} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
            </Field>
            <Field label="State" error={errors.state}>
              <select className={`input-field ${errors.state ? 'input-error' : ''}`} value={form.state} onChange={(e) => set('state', e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input className={`input-field ${errors.pincode ? 'input-error' : ''}`} value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="500001" maxLength={6} />
            </Field>
          </div>
        </div>
      </Section>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">← Back</button>
        <button onClick={handleNext} className="btn-primary flex-[2]">Continue to ID Upload →</button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div>
      <h3 className="font-body font-semibold text-primary-dark mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
        {icon && <span className="text-river">{icon}</span>}
        {title}
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">{children}</div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-body flex items-center gap-1">
          <FiAlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  )
}
