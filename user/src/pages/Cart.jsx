import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, ShoppingCart, Calendar, Clock } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import ScheduleServiceModal from '../components/ScheduleServiceModal.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const Cart = () => {
  const { items, removeItem, clearCart, total, count, updateSchedule } = useCart()
  const [editingItem, setEditingItem] = useState(null)

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

  const handleScheduleUpdate = ({ bookingDate, bookingTime }) => {
    if (!editingItem) return
    updateSchedule(editingItem.serviceId, { bookingDate, bookingTime })
    toast.success('Date & time updated')
    setEditingItem(null)
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
          onClick={clearCart}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Clear all
        </button>
      </div>

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
                    <p className="mt-0.5 text-xs text-slate-500">{item.categoryName}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.serviceId)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                {(item.bookingDate || item.bookingTime) ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-700">
                    {item.bookingDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.bookingDate)}
                      </span>
                    )}
                    {item.bookingTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.bookingTime}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600">Date & time not selected</p>
                )}
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="mt-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {item.bookingDate || item.bookingTime ? 'Change date & time' : 'Select date & time'}
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price)}</p>
                {item.discountPrice > 0 && (
                  <p className="text-xs text-slate-400 line-through">{formatCurrency(item.originalPrice)}</p>
                )}
              </div>

              <Link
                to={`/book/${item.serviceId}`}
                state={{ fromCart: true, bookAll: false }}
                className="mt-3 inline-flex text-sm font-semibold text-violet-700 hover:underline"
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
            className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
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
