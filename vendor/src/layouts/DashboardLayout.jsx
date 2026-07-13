import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wrench,
  CalendarCheck,
  Wallet,
  Star,
  UserCog,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/services', label: 'My Services', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/earnings', label: 'Earnings', icon: Wallet },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/profile', label: 'Profile', icon: UserCog },
]

const DashboardLayout = () => {
  const { vendor, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold brand-text leading-none">UrbanEase</p>
            <p className="text-xs text-slate-400">Vendor Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'brand-gradient text-white' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{vendor?.businessName || vendor?.name}</p>
              <p className="text-xs text-slate-400">{vendor?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
              {vendor?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
