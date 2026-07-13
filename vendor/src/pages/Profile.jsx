import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import Spinner from '../components/ui/Loader.jsx'

const Profile = () => {
  const { vendor, updateVendor } = useAuth()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    name: vendor?.name || '',
    phone: vendor?.phone || '',
    businessName: vendor?.businessName || '',
    serviceAreas: (vendor?.serviceAreas || []).join(', '),
  })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      }
      const { data } = await api.put('/auth/profile', payload)
      updateVendor(data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/change-password', pwd)
      toast.success('Password changed')
      setPwd({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Profile settings</h1>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('profile')}
          className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === 'profile' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}
        >
          Business info
        </button>
        <button
          onClick={() => setTab('security')}
          className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === 'security' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}
        >
          Security
        </button>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={saveProfile} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Owner name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Business name</label>
            <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input className="input bg-slate-50" value={vendor?.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Service areas (comma separated)</label>
            <input className="input" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} />
          </div>
          <button disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5">
            {saving && <Spinner className="h-4 w-4" />} Save changes
          </button>
        </form>
      ) : (
        <form onSubmit={changePassword} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input type="password" required className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input type="password" required minLength={6} className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
          </div>
          <button disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5">
            {saving && <Spinner className="h-4 w-4" />} Update password
          </button>
        </form>
      )}
    </div>
  )
}

export default Profile
