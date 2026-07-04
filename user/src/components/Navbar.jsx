import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sparkles, User, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const close = () => setOpen(false)

  return (
    <header
      className={`z-50 px-3 sm:px-5 ${
        isHome
          ? 'fixed top-0 left-0 right-0 bg-transparent pt-1.5 sm:pt-3'
          : 'sticky top-0 bg-white pt-1.5 sm:pt-3'
      }`}
    >
      <div
        className={`mx-auto max-w-6xl overflow-hidden transition-[border-radius,box-shadow] duration-300 ease-in-out ${
          open ? 'rounded-3xl' : 'rounded-full'
        } ${
          isHome
            ? 'border border-white/40 bg-white/65 shadow-[0_4px_24px_rgba(0,0,0,0.1)] backdrop-blur-xl md:border-slate-200 md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.08)] md:backdrop-blur-none'
            : 'border border-slate-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2" onClick={close}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient text-white sm:h-9 sm:w-9">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="truncate text-base font-bold brand-text sm:text-xl">UrbanEase</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? isHome
                        ? 'bg-black/10 text-black'
                        : 'bg-slate-100 text-violet-700'
                      : isHome
                        ? 'text-slate-800 hover:bg-black/5'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            {user ? (
              <>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
                  }`}
                >
                  <CalendarCheck className="h-4 w-4" />Bookings
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
                  }`}
                >
                  <User className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary rounded-full px-5 py-2 text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={`rounded-full p-1.5 text-slate-900 transition-colors duration-200 sm:p-2 md:hidden ${
              isHome ? 'hover:bg-black/5' : 'hover:bg-slate-100'
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="nav-hamburger" data-open={open} aria-hidden>
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
              <span className="nav-hamburger-line" />
            </span>
          </button>
        </div>

        <div
          data-open={open}
          className={`nav-mobile-panel grid md:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          aria-hidden={!open}
        >
          <div className={`overflow-hidden ${open ? '' : 'pointer-events-none'}`}>
            <div
              className={`nav-mobile-inner border-t px-4 pb-4 pt-1 sm:px-6 ${
                isHome ? 'border-white/30' : 'border-slate-100'
              }`}
            >
              <nav className="flex flex-col">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={close}
                    className={`block rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                      isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/bookings"
                      onClick={close}
                      className={`block rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                        isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={close}
                      className={`block rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                        isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Link
                      to="/login"
                      onClick={close}
                      className="flex-1 rounded-full border border-slate-200 py-2.5 text-center text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={close}
                      className="btn-primary flex-1 rounded-full py-2.5 text-center text-sm"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
