import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sparkles, User, CalendarCheck, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getNavbarMobilePanelClass, getNavbarShellClass } from '../utils/theme.js'
import CityPicker from './CityPicker.jsx'

const Navbar = () => {
  const { user } = useAuth()
  const { count } = useCart()
  const { theme, siteName } = useTheme()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const logoText = theme.navbar.logoText || siteName
  const shellClass = getNavbarShellClass(theme.navbar)
  const mobilePanelClass = getNavbarMobilePanelClass(theme.navbar)
  const isDarkNav = theme.navbar.style === 'dark'

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
  ]

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const close = () => setOpen(false)

  return (
    <>
      {open && (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-black/20 md:hidden"
          aria-hidden
        />
      )}
      <header
        className={`sticky top-0 z-50 w-full shrink-0 px-[10px] pt-1.5 sm:pt-3 ${
          isHome ? 'bg-transparent' : 'bg-transparent md:bg-white'
        }`}
      >
        <div className="relative w-full">
          <div
            className={`w-full overflow-hidden ${open ? 'max-md:rounded-b-none' : ''} ${shellClass}`}
          >
            <div className="flex w-full items-center justify-between gap-2 px-4 py-1.5 sm:gap-3 sm:px-5 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2" onClick={close}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient text-white sm:h-9 sm:w-9">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="truncate text-base font-bold brand-text sm:text-xl">{logoText}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? isDarkNav
                        ? 'bg-white/15 text-white'
                        : isHome
                        ? 'bg-black/10 text-black'
                        : 'bg-slate-100 text-violet-700'
                      : isDarkNav
                        ? 'text-white/90 hover:bg-white/10'
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
            <CityPicker variant="desktop" isDarkNav={isDarkNav} />
            <Link
              to={user ? '/cart' : '/login'}
              state={user ? undefined : { from: { pathname: '/cart' } }}
              className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                isDarkNav ? 'text-white/90 hover:bg-white/10' : isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden lg:inline">Cart</span>
              {user && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isDarkNav ? 'text-white/90 hover:bg-white/10' : isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
                  }`}
                >
                  <CalendarCheck className="h-4 w-4" />Bookings
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isDarkNav ? 'text-white/90 hover:bg-white/10' : isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50 hover:text-violet-700'
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
                    isDarkNav ? 'text-white/90 hover:bg-white/10' : isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-700 hover:bg-slate-50'
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
            className={`rounded-full p-1.5 transition-colors duration-200 sm:p-2 md:hidden ${
              isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-black/5'
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
          </div>

          <div
            data-open={open}
            className="nav-mobile-panel absolute left-0 right-0 top-full md:hidden"
            aria-hidden={!open}
          >
            <div className="nav-mobile-panel__clip">
              <div
                className={`nav-mobile-inner border border-t-0 px-4 pb-4 pt-1 max-md:rounded-b-2xl sm:px-5 ${mobilePanelClass}`}
              >
              <nav className="flex flex-col">
                <div className="px-0 py-1">
                  <CityPicker variant="mobile" isDarkNav={isDarkNav} onPicked={close} />
                </div>
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={close}
                    className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to={user ? '/cart' : '/login'}
                  state={user ? undefined : { from: { pathname: '/cart' } }}
                  onClick={close}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
                  }`}
                >
                  <span>Cart</span>
                  {user && count > 0 && (
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">{count}</span>
                  )}
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/bookings"
                      onClick={close}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
                    }`}
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={close}
                      className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
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
    </>
  )
}

export default Navbar
