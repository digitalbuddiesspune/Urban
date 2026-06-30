import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Users,
  LayoutGrid,
  Wrench,
  CalendarCheck,
  Star,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const DashboardLayout = () => {
  const { admin, logout } = useAuth()
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
        className={`fixed z-40 flex h-full w-64 flex-col bg-white shadow-sm transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold brand-text leading-none">UrbanEase</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
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
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{admin?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
              {admin?.name?.[0]?.toUpperCase()}
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
