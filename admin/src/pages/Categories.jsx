import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'

const emptyForm = { name: '', image: '', description: '', isActive: true }

const CategoryForm = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || emptyForm)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (initial) {
        await api.put(`/categories/${initial._id}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/categories', form)
        toast.success('Category created')
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
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-900">{initial ? 'Edit category' : 'Add category'}</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input className="input" placeholder="Category name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea className="input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-medium text-slate-700">
              Cancel
            </button>
            <button disabled={saving} className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5">
              {saving && <Spinner className="h-4 w-4" />} {initial ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/categories')
      .then((r) => setCategories(r.data.categories))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/categories/${delTarget}`)
      toast.success('Category deleted')
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
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Manage service categories</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" subtitle="Add your first service category." icon={LayoutGrid} />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c._id} className="card overflow-hidden">
              <div className="h-32 bg-slate-100">
                {c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                    {c.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setEditing(c); setShowForm(true) }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => setDelTarget(c._id)} className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
      <ConfirmModal
        open={!!delTarget}
        title="Delete category?"
        message="This category will be permanently removed."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Categories
