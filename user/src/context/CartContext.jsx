import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const STORAGE_KEY = 'ue_cart'
const CartContext = createContext(null)

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [items, setItems] = useState(() => (localStorage.getItem('ue_user_token') ? loadCart() : []))

  useEffect(() => {
    if (!user) {
      setItems((prev) => (prev.length === 0 ? prev : []))
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [user, items])

  const addItem = (service, schedule = {}) => {
    if (!user) return { ok: false, alreadyInCart: false }
    if (!service?._id) return { ok: false, alreadyInCart: false }

    const alreadyInCart = items.some((i) => i.serviceId === service._id)
    const price = service.discountPrice > 0 ? service.discountPrice : service.price

    setItems((prev) => {
      const existing = prev.find((i) => i.serviceId === service._id)
      if (existing) {
        return prev.map((i) =>
          i.serviceId === service._id
            ? {
                ...i,
                bookingDate: schedule.bookingDate || i.bookingDate || '',
                bookingTime: schedule.bookingTime || i.bookingTime || '',
              }
            : i
        )
      }
      return [
        ...prev,
        {
          serviceId: service._id,
          title: service.title,
          image: service.images?.[0] || '',
          price,
          originalPrice: service.price,
          discountPrice: service.discountPrice || 0,
          qty: 1,
          categoryName: service.categoryId?.name || '',
          bookingDate: schedule.bookingDate || '',
          bookingTime: schedule.bookingTime || '',
        },
      ]
    })

    return { ok: true, alreadyInCart }
  }

  const removeItem = (serviceId) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId))
  }

  const updateQty = (serviceId, qty) => {
    const next = Number(qty)
    if (!Number.isFinite(next) || next < 1) {
      removeItem(serviceId)
      return
    }
    setItems((prev) => prev.map((i) => (i.serviceId === serviceId ? { ...i, qty: next } : i)))
  }

  const updateSchedule = (serviceId, schedule = {}) => {
    setItems((prev) =>
      prev.map((i) =>
        String(i.serviceId) === String(serviceId)
          ? {
              ...i,
              bookingDate: schedule.bookingDate ?? i.bookingDate ?? '',
              bookingTime: schedule.bookingTime ?? i.bookingTime ?? '',
            }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const isInCart = (serviceId) => items.some((i) => i.serviceId === serviceId)

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, updateSchedule, clearCart, isInCart, count, total }}
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
