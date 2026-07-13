import { useEffect, useState } from 'react'
import { Users, Store, Wrench, CalendarCheck, Clock, CheckCircle2, IndianRupee } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'

const COLORS = ['#d97706', '#16a34a', '#94a3b8']

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  if (error || !data) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-slate-900">Could not load dashboard</p>
        <p className="mt-2 text-sm text-slate-500">{error || 'Unknown error'}</p>
      </div>
    )
  }

  const { stats, recentBookings } = data

  const barData = [
    { name: 'Users', value: stats.totalUsers },
    { name: 'Vendors', value: stats.totalVendors },
    { name: 'Services', value: stats.totalServices },
    { name: 'Bookings', value: stats.totalBookings },
  ]

  const pieData = [
    { name: 'Pending', value: stats.pendingBookings },
    { name: 'Completed', value: stats.completedBookings },
    { name: 'Other', value: Math.max(stats.totalBookings - stats.pendingBookings - stats.completedBookings, 0) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500">Platform analytics overview</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} tint="blue" />
        <StatCard icon={Store} label="Total Vendors" value={stats.totalVendors} tint="violet" />
        <StatCard icon={Wrench} label="Total Services" value={stats.totalServices} tint="indigo" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.totalBookings} tint="green" />
        <StatCard icon={Clock} label="Pending Bookings" value={stats.pendingBookings} tint="amber" />
        <StatCard icon={CheckCircle2} label="Completed Bookings" value={stats.completedBookings} tint="green" />
        <StatCard icon={IndianRupee} label="Revenue" value={formatCurrency(stats.revenue)} tint="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800">Platform overview</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#171717" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-800">Booking status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-slate-800">Recent bookings</h2>
        {recentBookings.length === 0 ? (
          <EmptyState title="No bookings yet" icon={CalendarCheck} />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-3 font-medium text-slate-700">{b.userId?.name}</td>
                    <td className="py-3 text-slate-600">{b.serviceId?.title}</td>
                    <td className="py-3 text-slate-500">{formatDate(b.bookingDate)}</td>
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
