import { useEffect, useState } from 'react'
import { Wallet, TrendingUp } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'

const Earnings = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/vendor/earnings')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
      <p className="text-sm text-slate-500">Track your paid bookings and revenue</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Wallet} label="Total Earnings" value={formatCurrency(data.total)} tint="green" />
        <StatCard icon={TrendingUp} label="Paid Bookings" value={data.count} tint="violet" />
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-slate-800">Paid transactions</h2>
        {data.bookings.length === 0 ? (
          <EmptyState title="No earnings yet" subtitle="Completed paid bookings will appear here." icon={Wallet} />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="py-3 font-medium text-slate-700">{b.serviceId?.title}</td>
                    <td className="py-3 text-slate-600">{b.userId?.name}</td>
                    <td className="py-3 text-slate-500">{formatDate(b.createdAt)}</td>
                    <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(b.price)}</td>
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

export default Earnings
