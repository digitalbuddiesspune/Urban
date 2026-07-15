import { useEffect, useState } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '../utils/helpers.js'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const normalizeDateForInput = (date) => {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().split('T')[0]
}

const normalizeTimeForInput = (time) => {
  if (!time) return ''
  const trimmed = String(time).trim()
  const exact = TIME_SLOTS.find((slot) => slot === trimmed)
  if (exact) return exact
  const padded = trimmed.length === 4 ? `0${trimmed}` : trimmed
  return TIME_SLOTS.find((slot) => slot === padded) || trimmed
}

const ScheduleServiceModal = ({
  service,
  open,
  onClose,
  onConfirm,
  initialDate = '',
  initialTime = '',
  confirmLabel = 'Add to cart',
}) => {
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setBookingDate(normalizeDateForInput(initialDate))
    setBookingTime(normalizeTimeForInput(initialTime))
    setError('')
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, initialDate, initialTime])

  if (!open || !service) return null

  const price = service.discountPrice > 0 ? service.discountPrice : service.price || service.originalPrice || 0
  const minDate = new Date().toISOString().split('T')[0]
  const hasExistingSchedule = Boolean(normalizeDateForInput(initialDate) || normalizeTimeForInput(initialTime))

  const handleConfirm = () => {
    if (!bookingDate) {
      setError('Please select a date')
      return
    }
    if (!bookingTime) {
      setError('Please select a time')
      return
    }
    onConfirm({ bookingDate, bookingTime })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="safe-bottom relative z-10 w-full max-w-[420px] overflow-hidden rounded-t-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:rounded-3xl"
      >
        {/* Mobile drag hint */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-100">
              <img
                src={service.images?.[0] || FALLBACK}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="schedule-modal-title" className="line-clamp-2 text-[17px] font-bold leading-snug text-slate-900">
                {service.title}
              </h2>
              <p className="mt-1 text-[15px] font-semibold text-slate-700">{formatCurrency(price)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {hasExistingSchedule && (
            <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Scheduled: </span>
              {[initialDate ? formatDate(normalizeDateForInput(initialDate) || initialDate) : null, formatTime(normalizeTimeForInput(initialTime))]
                .filter(Boolean)
                .join(' · ')}
            </div>
          )}

          {/* Date */}
          <div className="mt-6">
            <label htmlFor="schedule-date" className="flex items-center gap-2 text-[15px] font-semibold text-slate-800">
              <Calendar className="h-4 w-4 text-slate-700" strokeWidth={2} />
              Select date
            </label>
            <input
              id="schedule-date"
              type="date"
              min={minDate}
              value={bookingDate}
              onChange={(e) => {
                setBookingDate(e.target.value)
                setError('')
              }}
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Time */}
          <div className="mt-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-slate-800">
              <Clock className="h-4 w-4 text-slate-700" strokeWidth={2} />
              Select time
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {TIME_SLOTS.map((t) => {
                const active = bookingTime === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setBookingTime(t)
                      setError('')
                    }}
                    className={`min-h-[46px] rounded-xl border text-[14px] font-medium transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    aria-pressed={active}
                  >
                    {formatTime(t)}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-6 w-full rounded-full bg-black py-3.5 text-[15px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleServiceModal
