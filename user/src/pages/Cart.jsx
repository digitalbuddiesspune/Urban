import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, ShoppingCart, Calendar, Clock } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency, formatDate, formatTime } from '../utils/helpers.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import ScheduleServiceModal from '../components/ScheduleServiceModal.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const Cart = () => {
  const { items, loading, removeItem, clearCart, total, count, updateSchedule } = useCart()
  const [editingItem, setEditingItem] = useState(null)

  if (loading && !items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <p className="mt-6 text-sm text-slate-500">Loading cart…</p>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse services and tap Add to get started."
          icon={ShoppingCart}
          action={
            <Link to="/services" className="btn-primary mt-4 inline-flex px-5 py-2.5">
              Browse services
            </Link>
          }
        />
      </div>
    )
  }

  const handleScheduleUpdate = async ({ bookingDate, bookingTime }) => {
    if (!editingItem) return
    try {
      await updateSchedule(editingItem.serviceId, { bookingDate, bookingTime })
      toast.success('Date & time updated')
      setEditingItem(null)
    } catch (err) {
      toast.error(err.message || 'Could not update schedule')
    }
  }

  const handleRemove = async (serviceId) => {
    try {
      await removeItem(serviceId)
    } catch (err) {
      toast.error(err.message || 'Could not remove item')
    }
  }

  const handleClear = async () => {
    try {
      await clearCart()
    } catch (err) {
      toast.error(err.message || 'Could not clear cart')
    }
  }

  const hasSchedule = (item) => Boolean(item?.bookingDate && item?.bookingTime)
  const missingScheduleItem = items.find((item) => !hasSchedule(item))

  const requireSchedule = (item, { bookAll = false } = {}) => {
    if (bookAll) {
      const missing = items.find((i) => !hasSchedule(i))
      if (!missing) return true
      toast.error(`Please select date & time for "${missing.title}"`)
      setEditingItem(missing)
      return false
    }
    if (hasSchedule(item)) return true
    toast.error('Please select date & time before booking')
    setEditingItem(item)
    return false
  }

  const handleBookOne = (e, item) => {
    if (!requireSchedule(item)) {
      e.preventDefault()
    }
  }

  const handleBookAll = (e) => {
    if (!requireSchedule(null, { bookAll: true })) {
      e.preventDefault()
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {count} item{count === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Clear all
        </button>
      </div>

      {missingScheduleItem && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Select date & time for all services before booking.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.serviceId}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4"
          >
            <Link
              to={`/services/${item.serviceId}`}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24"
            >
              <img
                src={item.image || FALLBACK}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/services/${item.serviceId}`}
                    className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base"
                  >
                    {item.title}
                  </Link>
                  {item.categoryName && (
                    <p className="text-xs text-slate-500">{item.categoryName}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price)}</p>
                    {item.discountPrice > 0 && (
                      <p className="text-xs text-slate-400 line-through">
                        {formatCurrency(item.originalPrice)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.serviceId)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {hasSchedule(item) ? (
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium text-slate-600">
                    {item.bookingDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.bookingDate)}
                      </span>
                    )}
                    {item.bookingTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(item.bookingTime)}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="font-medium text-amber-600">Date & time not selected</span>
                )}
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="rounded-md bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  {hasSchedule(item) ? 'Change date & time' : 'Select date & time'}
                </button>
              </div>

              <Link
                to={`/book/${item.serviceId}`}
                state={{ fromCart: true, bookAll: false }}
                onClick={(e) => handleBookOne(e, item)}
                className={`mt-2.5 inline-flex text-sm font-semibold hover:underline ${
                  hasSchedule(item) ? 'text-violet-700' : 'cursor-not-allowed text-slate-400 no-underline'
                }`}
              >
                Book this service →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-16 mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:bottom-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(total)}</p>
          </div>
          <Link
            to={`/book/${items[0].serviceId}`}
            state={{ fromCart: true, bookAll: true }}
            onClick={handleBookAll}
            className={`btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold ${
              missingScheduleItem ? 'pointer-events-auto opacity-60' : ''
            }`}
            aria-disabled={Boolean(missingScheduleItem)}
          >
            Proceed to book
          </Link>
        </div>
      </div>

      <ScheduleServiceModal
        key={editingItem?.serviceId || 'closed'}
        service={
          editingItem
            ? {
                _id: editingItem.serviceId,
                title: editingItem.title,
                images: [editingItem.image],
                price: editingItem.price,
                discountPrice: editingItem.discountPrice,
              }
            : null
        }
        open={Boolean(editingItem)}
        initialDate={
          items.find((i) => String(i.serviceId) === String(editingItem?.serviceId))?.bookingDate ||
          editingItem?.bookingDate ||
          ''
        }
        initialTime={
          items.find((i) => String(i.serviceId) === String(editingItem?.serviceId))?.bookingTime ||
          editingItem?.bookingTime ||
          ''
        }
        confirmLabel="Update"
        onClose={() => setEditingItem(null)}
        onConfirm={handleScheduleUpdate}
      />
    </div>
  )
}

export default Cart
