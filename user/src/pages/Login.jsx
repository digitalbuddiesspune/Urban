import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import Spinner from '../components/ui/Loader.jsx'

const Login = () => {
  const { login } = useAuth()
  const { theme, siteName } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      const from = location.state?.from
      if (from?.pathname) {
        navigate(`${from.pathname}${from.search || ''}`, { state: from.state, replace: true })
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={theme.images.loginBackground ? { backgroundImage: `url(${theme.images.loginBackground})` } : undefined}
    >
      <div className={`mx-auto flex max-w-md flex-col px-4 py-10 sm:py-16 ${theme.images.loginBackground ? 'rounded-2xl bg-white/95 backdrop-blur-sm' : ''}`}>
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Login to {siteName}</p>
      </div>
      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <button disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-2.5">
          {loading && <Spinner className="h-4 w-4" />} Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        New to {siteName}?{' '}
        <Link to="/register" className="font-semibold text-violet-700">
          Create an account
        </Link>
      </p>
      </div>
    </div>
  )
}

export default Login
