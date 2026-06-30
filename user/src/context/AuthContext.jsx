import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ue_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const persist = (token, userData) => {
    localStorage.setItem('ue_user_token', token)
    localStorage.setItem('ue_user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.user.role !== 'user') {
      throw new Error('This portal is for customers only')
    }
    persist(data.token, data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    persist(data.token, data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('ue_user_token')
    localStorage.removeItem('ue_user')
    setUser(null)
  }

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile')
      setUser((prev) => ({ ...prev, ...data.user }))
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (localStorage.getItem('ue_user_token')) refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
