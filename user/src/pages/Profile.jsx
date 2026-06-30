import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User,
  Lock,
  MapPin,
  Trash2,
  Plus,
  Mail,
  Phone,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Wallet,
  Home,
} from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner, { PageLoader } from '../components/ui/Loader.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'

const emptyAddr = { label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' }

const StatTile = ({ icon: Icon, label, value, tint }) => {
  const tints = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tints[tint]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

const Profile = () => {
  const { user, refreshProfile } = useAuth()
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAddr, setNewAddr] = useState(emptyAddr)
  const [delTarget, setDelTarget] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/user/addresses'), api.get('/user/bookings')])
      .then(([a, b]) => {
        setAddresses(a.data.addresses)
        setBookings(b.data.bookings)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
  }, [user])

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.bookingStatus === 'completed').length,
    spent: bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.price || 0), 0),
    addresses: addresses.length,
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      await refreshProfile()
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

  const addAddress = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/user/addresses', newAddr)
      setAddresses(data.addresses)
      setNewAddr(emptyAddr)
      toast.success('Address added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const deleteAddress = async () => {
    try {
      const { data } = await api.delete(`/user/addresses/${delTarget}`)
      setAddresses(data.addresses)
      setDelTarget(null)
      toast.success('Address removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="card overflow-hidden">
        <div className="brand-gradient h-24" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-violet-600 text-2xl font-bold text-white shadow">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" /> {user.phone}
                  </span>
                )}
                {user?.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> Member since {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={CalendarCheck} label="Total Bookings" value={stats.total} tint="violet" />
            <StatTile icon={CheckCircle2} label="Completed" value={stats.completed} tint="green" />
            <StatTile icon={Wallet} label="Total Spent" value={formatCurrency(stats.spent)} tint="blue" />
            <StatTile icon={Home} label="Saved Addresses" value={stats.addresses} tint="amber" />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-slate-800">Account details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-slate-400">Full name</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Email</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Phone</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{user?.phone || 'Not added'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Member since</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{formatDate(user?.createdAt) || '-'}</dd>
              </div>
            </dl>
            <button onClick={() => setTab('edit')} className="btn-primary mt-5 px-5 py-2.5 text-sm">
              Edit profile
            </button>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Recent bookings</h2>
              <Link to="/bookings" className="text-sm font-semibold text-violet-700">
                View all
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                You have no bookings yet.{' '}
                <Link to="/services" className="font-medium text-violet-700">
                  Browse services
                </Link>
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{b.serviceId?.title || 'Service'}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.bookingDate)} at {b.bookingTime}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(b.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'edit' && (
        <form onSubmit={saveProfile} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input className="input bg-slate-50" value={user?.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5">
            {saving && <Spinner className="h-4 w-4" />} Save changes
          </button>
        </form>
      )}

      {tab === 'addresses' && (
        <div className="mt-6 space-y-4">
          {addresses.length === 0 && (
            <p className="text-sm text-slate-500">No saved addresses yet. Add one below.</p>
          )}
          {addresses.map((a) => (
            <div key={a._id} className="card flex items-start justify-between p-4">
              <div className="text-sm">
                <span className="font-medium text-slate-800">{a.label}</span>
                <p className="text-slate-500">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}
                </p>
              </div>
              <button onClick={() => setDelTarget(a._id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <form onSubmit={addAddress} className="card space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Plus className="h-4 w-4" /> Add new address
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input col-span-2" placeholder="Label (Home/Office)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
              <input className="input col-span-2" placeholder="Address line 1" required value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} />
              <input className="input" placeholder="City" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
              <input className="input" placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
              <input className="input" placeholder="Pincode" required value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
            </div>
            <button className="btn-primary px-5 py-2.5">Add address</button>
          </form>
        </div>
      )}

      {tab === 'security' && (
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

      <ConfirmModal
        open={!!delTarget}
        title="Remove address?"
        message="This address will be permanently removed."
        confirmText="Remove"
        onConfirm={deleteAddress}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Profile
