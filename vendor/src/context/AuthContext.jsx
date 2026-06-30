import { createContext, useContext, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [vendor, setVendor] = useState(() => {
    const stored = localStorage.getItem('ue_vendor')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.user.role !== 'vendor') {
      throw new Error('These credentials are not for a vendor account')
    }
    localStorage.setItem('ue_vendor_token', data.token)
    localStorage.setItem('ue_vendor', JSON.stringify(data.user))
    setVendor(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('ue_vendor_token')
    localStorage.removeItem('ue_vendor')
    setVendor(null)
  }

  const updateVendor = (data) => {
    const merged = { ...vendor, ...data }
    localStorage.setItem('ue_vendor', JSON.stringify(merged))
    setVendor(merged)
  }

  return (
    <AuthContext.Provider value={{ vendor, login, logout, updateVendor }}>{children}</AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
