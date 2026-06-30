import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, X, Wrench } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatCurrency, statusLabel } from '../utils/helpers.js'

const FILTERS = ['all', 'pending', 'approved', 'rejected']

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    const q = filter === 'all' ? '' : `?status=${filter}`
    api
      .get(`/admin/services${q}`)
      .then((r) => setServices(r.data.services))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const act = async (id, action) => {
    try {
      await api.put(`/admin/services/${id}/${action}`)
      toast.success(`Service ${action}d`)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Service approval</h1>
      <p className="text-sm text-slate-500">Review and approve vendor services</p>

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
      ) : services.length === 0 ? (
        <EmptyState title="No services" subtitle="Services matching this filter will appear here." icon={Wrench} />
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Service</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s._id}>
                  <td className="p-4 font-medium text-slate-800">{s.title}</td>
                  <td className="p-4 text-slate-600">{s.vendorId?.businessName || s.vendorId?.name}</td>
                  <td className="p-4 text-slate-500">{s.categoryId?.name}</td>
                  <td className="p-4 text-slate-700">{formatCurrency(s.price)}</td>
                  <td className="p-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {s.status !== 'approved' && (
                        <button onClick={() => act(s._id, 'approve')} className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100">
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      )}
                      {s.status !== 'rejected' && (
                        <button onClick={() => act(s._id, 'reject')} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                          <X className="h-4 w-4" /> Reject
                        </button>
                      )}
                    </div>
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

export default Services
