import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Migrate away from old localStorage cart
    localStorage.removeItem('ue_cart')
  }, [])

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/user/cart')
      setItems(data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    fetchCart()
  }, [user, fetchCart])

  const addItem = async (service, schedule = {}) => {
    if (!user || !service?._id) return { ok: false, alreadyInCart: false }
    try {
      const { data } = await api.post('/user/cart/items', {
        serviceId: service._id,
        bookingDate: schedule.bookingDate || '',
        bookingTime: schedule.bookingTime || '',
      })
      setItems(data.items || [])
      return { ok: true, alreadyInCart: Boolean(data.alreadyInCart) }
    } catch (err) {
      return { ok: false, alreadyInCart: false, error: err.message }
    }
  }

  const removeItem = async (serviceId) => {
    if (!user) return
    const { data } = await api.delete(`/user/cart/items/${serviceId}`)
    setItems(data.items || [])
  }

  const updateQty = async (serviceId, qty) => {
    if (!user) return
    const next = Number(qty)
    if (!Number.isFinite(next) || next < 1) {
      await removeItem(serviceId)
      return
    }
    const { data } = await api.put(`/user/cart/items/${serviceId}`, { qty: next })
    setItems(data.items || [])
  }

  const updateSchedule = async (serviceId, schedule = {}) => {
    if (!user) return
    const { data } = await api.put(`/user/cart/items/${serviceId}`, {
      bookingDate: schedule.bookingDate,
      bookingTime: schedule.bookingTime,
    })
    setItems(data.items || [])
  }

  const clearCart = async () => {
    if (!user) {
      setItems([])
      return
    }
    const { data } = await api.delete('/user/cart')
    setItems(data.items || [])
  }

  const isInCart = (serviceId) => items.some((i) => String(i.serviceId) === String(serviceId))

  const count = useMemo(() => items.reduce((sum, i) => sum + (i.qty || 1), 0), [items])
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQty,
        updateSchedule,
        clearCart,
        refreshCart: fetchCart,
        isInCart,
        count,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
