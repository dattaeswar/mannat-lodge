import { differenceInYears, parseISO } from 'date-fns'

export function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone)
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePincode(pincode) {
  return /^\d{6}$/.test(pincode)
}

export function validateAge(dob) {
  const birthDate = typeof dob === 'string' ? parseISO(dob) : dob
  return differenceInYears(new Date(), birthDate) >= 18
}

export function calculateAge(dob) {
  const birthDate = typeof dob === 'string' ? parseISO(dob) : dob
  return differenceInYears(new Date(), birthDate)
}

export function validateFileType(file) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf']
  return allowed.includes(file.type)
}

export function validateFileSize(file, maxMB = 5) {
  return file.size <= maxMB * 1024 * 1024
}

export function validateGuestForm(data) {
  const errors = {}

  if (!data.first_name?.trim()) errors.first_name = 'First name required'
  if (!data.last_name?.trim()) errors.last_name = 'Last name required'
  if (!data.email?.trim()) errors.email = 'Email required'
  else if (!validateEmail(data.email)) errors.email = 'Invalid email format'
  if (!data.phone?.trim()) errors.phone = 'Phone required'
  else if (!validatePhone(data.phone)) errors.phone = 'Enter valid 10-digit Indian mobile number'
  if (!data.date_of_birth) errors.date_of_birth = 'Date of birth required'
  else if (!validateAge(data.date_of_birth)) errors.date_of_birth = 'Must be 18 or older to book'
  if (!data.id_type) errors.id_type = 'ID type required'
  if (!data.id_number?.trim()) errors.id_number = 'ID number required'
  if (!data.address?.trim()) errors.address = 'Address required'
  if (!data.city?.trim()) errors.city = 'City required'
  if (!data.state) errors.state = 'State required'
  if (!data.pincode?.trim()) errors.pincode = 'Pincode required'
  else if (!validatePincode(data.pincode)) errors.pincode = 'Enter valid 6-digit pincode'

  return errors
}

export function validateAadhar(number) {
  return /^\d{12}$/.test(number.replace(/\s/g, ''))
}

export function validatePAN(number) {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(number.toUpperCase())
}
