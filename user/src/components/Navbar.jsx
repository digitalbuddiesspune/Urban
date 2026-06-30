import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Sparkles, User, CalendarCheck, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold brand-text">UrbanEase</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'text-violet-700' : 'text-slate-600 hover:text-violet-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/bookings"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-700"
              >
                <CalendarCheck className="h-4 w-4" /> My Bookings
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-violet-700"
              >
                <User className="h-4 w-4" /> {user.name?.split(' ')[0]}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Login
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/bookings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700">
                My Bookings
              </Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700">
                Profile
              </Link>
            </>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm font-medium">
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 py-2 text-center text-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
