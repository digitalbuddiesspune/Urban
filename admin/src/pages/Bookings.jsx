import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarCheck } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatCurrency, formatDate, statusLabel, STATUS_STYLES } from '../utils/helpers.js'

const BOOKING_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
]
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']
const FILTERS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled']

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    const q = filter === 'all' ? '' : `?status=${filter}`
    api
      .get(`/admin/bookings${q}`)
      .then((r) => setBookings(r.data.bookings))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const update = async (id, field, value) => {
    try {
      await api.put(`/admin/bookings/${id}`, { [field]: value })
      toast.success('Booking updated')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Booking management</h1>
      <p className="text-sm text-slate-500">View all bookings and manage status & payments</p>

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

      {loading ? (
        <PageLoader />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" subtitle="Bookings matching this filter will appear here." icon={CalendarCheck} />
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Booking status</th>
                <th className="p-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="p-4 font-medium text-slate-800">{b.userId?.name}</td>
                  <td className="p-4 text-slate-600">{b.vendorId?.businessName || b.vendorId?.name}</td>
                  <td className="p-4 text-slate-600">{b.serviceId?.title}</td>
                  <td className="p-4 text-slate-500">{formatDate(b.bookingDate)}</td>
                  <td className="p-4 font-semibold text-green-600">{formatCurrency(b.price)}</td>
                  <td className="p-4">
                    <select
                      value={b.bookingStatus}
                      onChange={(e) => update(b._id, 'bookingStatus', e.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[b.bookingStatus] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={b.paymentStatus}
                      onChange={(e) => update(b._id, 'paymentStatus', e.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[b.paymentStatus] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Bookings
