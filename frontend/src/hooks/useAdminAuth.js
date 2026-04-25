import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('mannat_admin')
    const token = localStorage.getItem('mannat_admin_token')
    if (stored && token) {
      setAdmin(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.auth.adminLogin({ email, password })
    localStorage.setItem('mannat_admin_token', res.data.token)
    localStorage.setItem('mannat_admin', JSON.stringify(res.data.admin))
    setAdmin(res.data.admin)
    return res.data.admin
  }, [])

  const logout = useCallback(async () => {
    try { await api.auth.adminLogout() } catch {}
    localStorage.removeItem('mannat_admin_token')
    localStorage.removeItem('mannat_admin')
    setAdmin(null)
  }, [])

  return { admin, loading, login, logout, isAuthenticated: !!admin }
}
