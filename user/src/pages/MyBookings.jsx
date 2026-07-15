import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarX, Star } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import StarRating from '../components/ui/StarRating.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Spinner from '../components/ui/Loader.jsx'
import { formatCurrency, formatDate, formatTime } from '../utils/helpers.js'

const ReviewModal = ({ booking, onClose, onDone }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.post('/user/reviews', { bookingId: booking._id, rating, comment })
      toast.success('Thanks for your review!')
      onDone()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900">Rate your experience</h3>
        <p className="mt-1 text-sm text-slate-500">{booking.serviceId?.title}</p>
        <div className="mt-4">
          <StarRating value={rating} size={28} onChange={setRating} />
        </div>
        <textarea
          className="input mt-4"
          rows={3}
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-700">
            Cancel
          </button>
          <button onClick={submit} disabled={loading} className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5">
            {loading && <Spinner className="h-4 w-4" />} Submit
          </button>
        </div>
      </div>
    </div>
  )
}

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)

  const load = () => {
    setLoading(true)
    api
      .get('/user/bookings')
      .then((r) => setBookings(r.data.bookings))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const confirmCancel = async () => {
    setCancelling(true)
    try {
      await api.put(`/user/bookings/${cancelTarget}/cancel`)
      toast.success('Booking cancelled')
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My bookings</h1>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          subtitle="Browse our services and book your first one."
          icon={CalendarX}
          action={
            <Link to="/services" className="btn-primary px-5 py-2.5">
              Explore services
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{b.serviceId?.title || 'Service'}</h3>
                  <p className="text-sm text-slate-500">
                    {b.vendorId?.businessName || b.vendorId?.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(b.bookingDate)} at {formatTime(b.bookingTime)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:text-right">
                  <StatusBadge status={b.bookingStatus} />
                  <div>
                    <p className="font-bold text-slate-900">{formatCurrency(b.price)}</p>
                    <p className="text-xs text-slate-400 capitalize">{b.paymentMethod} · {b.paymentStatus}</p>
                  </div>
                </div>
              </div>

              {(b.bookingStatus === 'pending' || b.bookingStatus === 'accepted') && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setCancelTarget(b._id)}
                    className="rounded-lg border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel booking
                  </button>
                </div>
              )}

              {b.bookingStatus === 'completed' && !b.isReviewed && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setReviewTarget(b)}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <Star className="h-4 w-4" /> Rate & review
                  </button>
                </div>
              )}
              {b.isReviewed && <p className="mt-3 text-xs text-green-600">✓ You reviewed this service</p>}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel booking?"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, cancel"
        loading={cancelling}
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
      />
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={() => {
            setReviewTarget(null)
            load()
          }}
        />
      )}
    </div>
  )
}

export default MyBookings
