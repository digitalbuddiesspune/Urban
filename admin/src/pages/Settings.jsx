import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon } from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner, { PageLoader } from '../components/ui/Loader.jsx'

const Settings = () => {
  const { admin } = useAuth()
  const [platform, setPlatform] = useState(null)
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(true)
  const [savingPlatform, setSavingPlatform] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((r) => setPlatform(r.data.settings))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const savePlatform = async (e) => {
    e.preventDefault()
    setSavingPlatform(true)
    try {
      const { data } = await api.put('/admin/settings', {
        siteName: platform.siteName,
        supportEmail: platform.supportEmail,
        commission: Number(platform.commission),
      })
      setPlatform(data.settings)
      toast.success('Platform settings saved')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingPlatform(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setSavingPwd(true)
    try {
      await api.put('/auth/change-password', pwd)
      toast.success('Password changed')
      setPwd({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingPwd(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <SettingsIcon className="h-6 w-6" /> Settings
      </h1>
      <p className="text-sm text-slate-500">Manage platform configuration and your account</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          Customize the customer website visually — colors, images, navbar & layout — in{' '}
          <a href="/site-customizer" className="font-semibold text-black underline">
            Site Customizer
          </a>
          .
        </p>
      </div>

      <form onSubmit={savePlatform} className="card mt-6 space-y-4 p-6">
        <h2 className="font-semibold text-slate-800">Platform settings</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Site name</label>
          <input className="input" value={platform.siteName} onChange={(e) => setPlatform({ ...platform, siteName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Support email</label>
          <input className="input" value={platform.supportEmail} onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Commission (%)</label>
          <input type="number" className="input" value={platform.commission} onChange={(e) => setPlatform({ ...platform, commission: e.target.value })} />
        </div>
        <button disabled={savingPlatform} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          {savingPlatform && <Spinner className="h-4 w-4" />} Save settings
        </button>
      </form>

      <form onSubmit={changePassword} className="card mt-6 space-y-4 p-6">
        <h2 className="font-semibold text-slate-800">Change admin password</h2>
        <p className="text-xs text-slate-400">Logged in as {admin?.email}</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
          <input type="password" required className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
          <input type="password" required minLength={6} className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
        </div>
        <button disabled={savingPwd} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          {savingPwd && <Spinner className="h-4 w-4" />} Update password
        </button>
      </form>
    </div>
  )
}

export default Settings
