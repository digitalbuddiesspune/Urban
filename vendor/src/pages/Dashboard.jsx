import { useEffect, useState } from 'react'
import { Wrench, CalendarCheck, Clock, CheckCircle2, Wallet, Star } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/vendor/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  if (!data) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-slate-900">Could not load dashboard</p>
        <p className="mt-2 text-sm text-slate-500">Please try again later.</p>
      </div>
    )
  }

  const { stats, recentBookings } = data

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500">Overview of your business performance</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Wrench} label="Total Services" value={stats.totalServices} tint="violet" />
        <StatCard icon={CheckCircle2} label="Approved Services" value={stats.approvedServices} tint="green" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.totalBookings} tint="blue" />
        <StatCard icon={Clock} label="Pending Bookings" value={stats.pendingBookings} tint="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedBookings} tint="green" />
        <StatCard icon={Wallet} label="Earnings" value={formatCurrency(stats.earnings)} tint="violet" />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-white p-4 shadow-sm">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        <span className="text-sm text-slate-600">
          Your average rating is <strong>{stats.rating || 'N/A'}</strong>
        </span>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-slate-800">Recent bookings</h2>
        {recentBookings.length === 0 ? (
          <EmptyState title="No bookings yet" subtitle="Your bookings will appear here." icon={CalendarCheck} />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-3 font-medium text-slate-700">{b.userId?.name}</td>
                    <td className="py-3 text-slate-600">{b.serviceId?.title}</td>
                    <td className="py-3 text-slate-500">{formatDate(b.bookingDate)}</td>
                    <td className="py-3 font-semibold text-green-600">{formatCurrency(b.price)}</td>
                    <td className="py-3">
                      <StatusBadge status={b.bookingStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
