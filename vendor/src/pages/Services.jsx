import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { formatCurrency } from '../utils/helpers.js'

const emptyForm = {
  title: '',
  categoryId: '',
  description: '',
  price: '',
  discountPrice: '',
  estimatedTime: '',
  images: '',
  serviceArea: '',
  availability: true,
}

const ServiceForm = ({ categories, initial, onClose, onSaved }) => {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          categoryId: initial.categoryId?._id || initial.categoryId || '',
          images: (initial.images || []).join(', '),
          serviceArea: (initial.serviceArea || []).join(', '),
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        serviceArea: form.serviceArea ? form.serviceArea.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      if (initial) {
        await api.put(`/vendor/services/${initial._id}`, payload)
        toast.success('Service updated (sent for re-approval)')
      } else {
        await api.post('/vendor/services', payload)
        toast.success('Service added (pending approval)')
      }
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900">{initial ? 'Edit service' : 'Add new service'}</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input className="input" placeholder="Service title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea className="input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input" placeholder="Price (₹)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input type="number" className="input" placeholder="Discount price (₹)" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
          <input className="input" placeholder="Estimated time (e.g. 1-2 hrs)" value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} />
          <input className="input" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <input className="input" placeholder="Service areas (comma separated)" value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} />
            Available for booking
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-700">
              Cancel
            </button>
            <button disabled={saving} className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5">
              {saving && <Spinner className="h-4 w-4" />} {initial ? 'Update' : 'Add service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Services = () => {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/vendor/services'), api.get('/categories')])
      .then(([s, c]) => {
        setServices(s.data.services)
        setCategories(c.data.categories)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/vendor/services/${delTarget}`)
      toast.success('Service deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My services</h1>
          <p className="text-sm text-slate-500">Add and manage the services you offer</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5"
        >
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          subtitle="Add your first service to start receiving bookings."
          icon={Wrench}
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <div key={s._id} className="card overflow-hidden">
              <img
                src={s.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'}
                alt={s.title}
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-600">{s.categoryId?.name}</p>
                    <h3 className="font-semibold text-slate-800">{s.title}</h3>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-2 font-bold text-green-600">{formatCurrency(s.discountPrice > 0 ? s.discountPrice : s.price)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(s)
                      setShowForm(true)
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDelTarget(s._id)}
                    className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServiceForm
          categories={categories}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load()
          }}
        />
      )}
      <ConfirmModal
        open={!!delTarget}
        title="Delete service?"
        message="This service will be permanently removed."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Services
