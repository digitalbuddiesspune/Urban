import { NavLink, useLocation } from 'react-router-dom'
import { Home, Grid3X3, ShoppingCart, CalendarCheck, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/services', label: 'Services', icon: Grid3X3, match: '/services' },
  { to: '/cart', label: 'Cart', icon: ShoppingCart, match: '/cart', cart: true, auth: true },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck, auth: true, match: '/bookings' },
  { to: '/profile', label: 'Profile', icon: User, auth: true, match: '/profile' },
]

const isTabActive = (tab, pathname, isActive) => {
  if (tab.end) return isActive
  if (tab.match) return pathname === tab.match || pathname.startsWith(`${tab.match}/`)
  return isActive
}

const MobileBottomNav = () => {
  const { user } = useAuth()
  const { count } = useCart()
  const { pathname } = useLocation()

  // Hide on booking checkout flow where a primary CTA already sticks to bottom
  if (pathname.startsWith('/book/')) return null

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const to = tab.auth && !user ? '/login' : tab.to
          return (
            <NavLink
              key={tab.label}
              to={to}
              end={tab.end}
              state={tab.auth && !user ? { from: { pathname: tab.to } } : undefined}
              className={({ isActive }) => {
                const active = isTabActive(tab, pathname, isActive)
                return `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition ${
                  active ? 'font-semibold text-slate-900' : 'text-slate-400'
                }`
              }}
            >
              {({ isActive }) => {
                const active = isTabActive(tab, pathname, isActive)
                return (
                  <>
                    <span className="relative">
                      <tab.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                      {tab.cart && user && count > 0 && (
                        <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold leading-none text-white">
                          {count > 9 ? '9+' : count}
                        </span>
                      )}
                    </span>
                    <span>{tab.label}</span>
                  </>
                )
              }}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
