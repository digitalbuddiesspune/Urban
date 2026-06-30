import { createContext, useContext, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('ue_admin')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Admin credentials required.')
    }
    localStorage.setItem('ue_admin_token', data.token)
    localStorage.setItem('ue_admin', JSON.stringify(data.user))
    setAdmin(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('ue_admin_token')
    localStorage.removeItem('ue_admin')
    setAdmin(null)
  }

  return <AuthContext.Provider value={{ admin, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
