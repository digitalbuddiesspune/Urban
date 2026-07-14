import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarCheck } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatCurrency, formatDate, statusLabel, STATUS_STYLES } from '../utils/helpers.js'

const NEXT_STATUS = {
  pending: ['accepted', 'rejected'],
  accepted: ['on_the_way', 'cancelled'],
  on_the_way: ['in_progress'],
  in_progress: ['completed'],
}

const FILTERS = ['all', 'pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'rejected']
const PAYMENT_FILTERS = ['', 'pending', 'paid', 'failed', 'refunded']

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('status') || 'all')
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('payment') || '')

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    if (paymentFilter) params.set('payment', paymentFilter)
    const q = params.toString() ? `?${params.toString()}` : ''
    api
      .get(`/vendor/bookings${q}`)
      .then((r) => setBookings(r.data.bookings))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter, paymentFilter])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    if (paymentFilter) params.set('payment', paymentFilter)
    setSearchParams(params, { replace: true })
  }, [filter, paymentFilter, setSearchParams])

  const updateStatus = async (id, status) => {
    try {
      const body = { bookingStatus: status }
      if (status === 'completed') body.paymentStatus = 'paid'
      await api.put(`/vendor/bookings/${id}/status`, body)
      toast.success(`Booking ${statusLabel(status).toLowerCase()}`)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
      <p className="text-sm text-slate-500">Manage bookings for your services</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
              filter === f ? 'brand-gradient text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {statusLabel(f)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment</span>
        {PAYMENT_FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setPaymentFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              paymentFilter === f ? 'bg-black text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f ? statusLabel(f) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings here" subtitle="Bookings matching this filter will show up here." icon={CalendarCheck} />
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{b.serviceId?.title}</h3>
                  <p className="text-sm text-slate-500">
                    {b.userId?.name} · {b.userId?.phone}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(b.bookingDate)} at {b.bookingTime}
                  </p>
                  {b.address && (
                    <p className="mt-1 text-xs text-slate-400">
                      {b.address.line1}, {b.address.city} - {b.address.pincode}
                    </p>
                  )}
                  {b.userNote && <p className="mt-1 text-xs italic text-slate-500">Note: {b.userNote}</p>}
                </div>
                <div className="text-right">
                  <StatusBadge status={b.bookingStatus} />
                  <p className="mt-2 font-bold text-green-600">{formatCurrency(b.price)}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {b.paymentMethod} ·{' '}
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLES[b.paymentStatus] || 'bg-slate-100 text-slate-700'}`}>
                      {statusLabel(b.paymentStatus)}
                    </span>
                  </p>
                </div>
              </div>

              {NEXT_STATUS[b.bookingStatus] && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {NEXT_STATUS[b.bookingStatus].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(b._id, s)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                        s === 'rejected' || s === 'cancelled'
                          ? 'border border-red-200 text-red-600 hover:bg-red-50'
                          : 'btn-primary'
                      }`}
                    >
                      Mark {statusLabel(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings
