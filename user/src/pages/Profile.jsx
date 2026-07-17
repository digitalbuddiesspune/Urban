import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  LogOut,
  Star,
  Crosshair,
} from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'
import Spinner, { PageLoader } from '../components/ui/Loader.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { formatCurrency, formatDate, formatTime } from '../utils/helpers.js'

const emptyAddr = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  lat: null,
  lng: null,
  isPrimary: false,
}

const getBrowserCoords = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Unable to get location')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  })

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
  const { user, refreshProfile, logout, updateUser } = useAuth()
  const { setAddressLocation } = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAddr, setNewAddr] = useState(emptyAddr)
  const [delTarget, setDelTarget] = useState(null)
  const [pinning, setPinning] = useState(false)
  const [settingPrimary, setSettingPrimary] = useState(null)

  const syncAddresses = (next) => {
    setAddresses(next)
    updateUser({ addresses: next })
  }

  useEffect(() => {
    Promise.all([api.get('/user/addresses'), api.get('/user/bookings')])
      .then(([a, b]) => {
        setAddresses(a.data.addresses)
        updateUser({ addresses: a.data.addresses })
        setBookings(b.data.bookings)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const pinNewAddress = async () => {
    setPinning(true)
    try {
      const coords = await getBrowserCoords()
      setNewAddr((a) => ({ ...a, lat: coords.lat, lng: coords.lng }))
      toast.success('Location pinned for this address')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPinning(false)
    }
  }

  const addAddress = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/user/addresses', newAddr)
      syncAddresses(data.addresses)
      const primary = data.addresses.find((a) => a.isPrimary)
      if (primary) setAddressLocation(primary, { silent: true })
      setNewAddr(emptyAddr)
      toast.success('Address added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const makePrimary = async (address) => {
    setSettingPrimary(address._id)
    try {
      // Backend derives coordinates from the address city/pincode.
      const { data } = await api.put(`/user/addresses/${address._id}/primary`)
      syncAddresses(data.addresses)
      setAddressLocation(data.primary || data.addresses.find((a) => a.isPrimary))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSettingPrimary(null)
    }
  }

  const deleteAddress = async () => {
    try {
      const { data } = await api.delete(`/user/addresses/${delTarget}`)
      syncAddresses(data.addresses)
      const primary = data.addresses.find((a) => a.isPrimary)
      if (primary) setAddressLocation(primary, { silent: true })
      setDelTarget(null)
      toast.success('Address removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="card overflow-hidden">
        <div className="brand-gradient h-24" />
        <div className="px-4 pb-6 sm:px-6">
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

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <div
                    key={b._id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{b.serviceId?.title || 'Service'}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(b.bookingDate)} at {formatTime(b.bookingTime)}
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
          <p className="text-sm text-slate-500">
            Set a <strong>primary</strong> address to see services nearest to that location. We locate it
            from the <strong>city / pincode</strong> — no GPS needed.
          </p>
          {addresses.length === 0 && (
            <p className="text-sm text-slate-500">No saved addresses yet. Add one below.</p>
          )}
          {addresses.map((a) => {
            const hasPin = Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng))
            return (
              <div
                key={a._id}
                className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between ${
                  a.isPrimary ? 'border-violet-300 ring-1 ring-violet-200' : ''
                }`}
              >
                <div className="min-w-0 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">{a.label}</span>
                    {a.isPrimary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Star className="h-3 w-3 fill-white" /> Primary
                      </span>
                    )}
                    {hasPin && <span className="text-[11px] font-medium text-emerald-600">Located</span>}
                  </div>
                  <p className="mt-1 text-slate-500">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!a.isPrimary && (
                    <button
                      type="button"
                      disabled={settingPrimary === a._id}
                      onClick={() => makePrimary(a)}
                      className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
                    >
                      {settingPrimary === a._id ? 'Setting…' : 'Set primary'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDelTarget(a._id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remove address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <form onSubmit={addAddress} className="card space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Plus className="h-4 w-4" /> Add new address
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="input col-span-2"
                placeholder="Label (Home/Office)"
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
              />
              <input
                className="input col-span-2"
                placeholder="Address line 1"
                required
                value={newAddr.line1}
                onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
              />
              <input
                className="input"
                placeholder="City"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              />
              <input
                className="input"
                placeholder="State"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
              />
              <input
                className="input"
                placeholder="Pincode"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <button
                type="button"
                onClick={pinNewAddress}
                disabled={pinning}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                <Crosshair className="h-3.5 w-3.5" />
                {pinning ? 'Pinning…' : 'Use precise GPS (optional)'}
              </button>
              {newAddr.lat != null && newAddr.lng != null ? (
                <span className="text-xs font-medium text-emerald-700">
                  Pinned ({Number(newAddr.lat).toFixed(4)}, {Number(newAddr.lng).toFixed(4)})
                </span>
              ) : (
                <span className="text-xs text-slate-500">Otherwise located from city / pincode</span>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={newAddr.isPrimary}
                onChange={(e) => setNewAddr({ ...newAddr, isPrimary: e.target.checked })}
                className="rounded border-slate-300"
              />
              Set as primary location for nearest services
            </label>

            <button className="btn-primary px-5 py-2.5">Add address</button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <form onSubmit={changePassword} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              required
              className="input"
              value={pwd.currentPassword}
              onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={pwd.newPassword}
              onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            />
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

      <div className="card mt-8 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-slate-900">Log out</p>
          <p className="mt-0.5 text-sm text-slate-500">Sign out of your UrbanEase account on this device.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-black hover:bg-black hover:text-white sm:w-auto"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )
}

export default Profile
