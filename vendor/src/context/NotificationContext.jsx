import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from './AuthContext.jsx'

const POLL_INTERVAL = 60000

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { vendor } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/vendor/notifications')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // keep last known state on poll errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!vendor) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    refresh()
    const id = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [vendor, refresh])

  const markAllRead = useCallback(async () => {
    try {
      const { data } = await api.put('/vendor/notifications/read')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // ignore
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, loading, unreadCount, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext)
