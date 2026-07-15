import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, Ban, CheckCircle2, Store, MapPin, Navigation } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { coordsFromVendor, detectBrowserLocation } from '../utils/location.js'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  businessName: '',
  serviceAreas: '',
  city: '',
  address: '',
  pincode: '',
  lat: '',
  lng: '',
}

const VendorForm = ({ initial, onClose, onSaved }) => {
  const coords = coordsFromVendor(initial)
  const [form, setForm] = useState(
    initial
      ? {
          ...emptyForm,
          ...initial,
          password: '',
          serviceAreas: (initial.serviceAreas || []).join(', '),
          city: initial.city || '',
          address: initial.address || '',
          pincode: initial.pincode || '',
          lat: coords.lat,
          lng: coords.lng,
        }
      : emptyForm,
  )
  const [saving, setSaving] = useState(false)
  const [detecting, setDetecting] = useState(false)

  const detect = async () => {
    setDetecting(true)
    try {
      const pos = await detectBrowserLocation()
      setForm((f) => ({ ...f, lat: String(pos.lat), lng: String(pos.lng) }))
      toast.success('Location detected')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDetecting(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        serviceAreas: form.serviceAreas ? form.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean) : [],
        city: form.city,
        address: form.address,
        pincode: form.pincode,
        lat: form.lat,
        lng: form.lng,
      }
      if (form.password) payload.password = form.password

      if (initial) {
        await api.put(`/admin/vendors/${initial._id}`, payload)
        toast.success('Vendor updated')
      } else {
        await api.post('/admin/vendors', { ...payload, password: form.password })
        toast.success('Vendor created')
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
        <h3 className="text-lg font-semibold text-slate-900">{initial ? 'Edit vendor' : 'Create vendor account'}</h3>
        <p className="mt-1 text-xs text-slate-500">Location is required so customers get the nearest vendor.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input className="input" placeholder="Owner name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <input type="email" className="input" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input
            type="password"
            className="input"
            placeholder={initial ? 'New password (leave blank to keep)' : 'Password'}
            required={!initial}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input className="input" placeholder="Service areas (comma separated)" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <MapPin className="h-4 w-4" /> Base location
            </p>
            <div className="space-y-2">
              <input className="input" placeholder="City *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input" placeholder="Full address *" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input className="input" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  type="number"
                  step="any"
                  placeholder="Latitude *"
                  required={!initial}
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  step="any"
                  placeholder="Longitude *"
                  required={!initial}
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={detect}
                disabled={detecting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {detecting ? <Spinner className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
                Detect location from this device
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-700">
              Cancel
            </button>
            <button disabled={saving} className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5">
              {saving && <Spinner className="h-4 w-4" />} {initial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = (q = '') => {
    setLoading(true)
    api
      .get(`/admin/vendors${q ? `?search=${q}` : ''}`)
      .then((r) => setVendors(r.data.vendors))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const toggleBlock = async (v) => {
    try {
      await api.put(`/admin/vendors/${v._id}`, { status: v.status === 'active' ? 'blocked' : 'active' })
      toast.success(v.status === 'active' ? 'Vendor blocked' : 'Vendor activated')
      load(search)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/vendors/${delTarget}`)
      toast.success('Vendor deleted')
      setDelTarget(null)
      load(search)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor management</h1>
          <p className="text-sm text-slate-500">Create and manage vendor accounts</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5"
        >
          <Plus className="h-4 w-4" /> Add vendor
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:max-w-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(search)}
          placeholder="Search vendors..."
          className="flex-1 py-2.5 text-sm outline-none"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : vendors.length === 0 ? (
        <EmptyState title="No vendors yet" subtitle="Create your first vendor account." icon={Store} />
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Vendor</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Areas</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{v.businessName || v.name}</p>
                    <p className="text-xs text-slate-400">{v.name}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    <p>{v.email}</p>
                    <p className="text-xs text-slate-400">{v.phone}</p>
                  </td>
                  <td className="p-4 text-slate-500">{v.serviceAreas?.join(', ') || '-'}</td>
                  <td className="p-4 text-slate-600">
                    {v.city ? (
                      <span className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {v.city}
                        {v.location?.coordinates?.length === 2 ? '' : ' (no GPS)'}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Missing</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{v.rating || 0} ★</td>
                  <td className="p-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(v); setShowForm(true) }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleBlock(v)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" title={v.status === 'active' ? 'Block' : 'Activate'}>
                        {v.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setDelTarget(v._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VendorForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            load(search)
          }}
        />
      )}
      <ConfirmModal
        open={!!delTarget}
        title="Delete vendor?"
        message="This will permanently delete the vendor and all their services."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Vendors
