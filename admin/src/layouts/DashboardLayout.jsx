import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Users,
  LayoutGrid,
  Wrench,
  CalendarCheck,
  Star,
  Bell,
  Paintbrush,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

const STORAGE_KEY = 'ue_admin_sidebar'
const DEFAULT_WIDTH = 256
const MIN_WIDTH = 200
const MAX_WIDTH = 380
const COLLAPSED_WIDTH = 72

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/site-customizer', label: 'Site Customizer', icon: Paintbrush },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const loadSidebarPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { width: DEFAULT_WIDTH, collapsed: false }
    const parsed = JSON.parse(raw)
    return {
      width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Number(parsed.width) || DEFAULT_WIDTH)),
      collapsed: Boolean(parsed.collapsed),
    }
  } catch {
    return { width: DEFAULT_WIDTH, collapsed: false }
  }
}

const NotificationBadge = ({ count, collapsed }) => {
  if (!count) return null
  const label = count > 99 ? '99+' : count
  if (collapsed) {
    return (
      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
        {label}
      </span>
    )
  }
  return (
    <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
      {label}
    </span>
  )
}

const DashboardLayout = () => {
  const { admin, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [prefs, setPrefs] = useState(loadSidebarPrefs)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(DEFAULT_WIDTH)

  const { width, collapsed } = prefs
  const desktopWidth = collapsed ? COLLAPSED_WIDTH : width

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ width, collapsed }))
  }, [width, collapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleCollapsed = () => {
    setPrefs((p) => ({ ...p, collapsed: !p.collapsed }))
  }

  const onDragStart = (e) => {
    if (collapsed) return
    e.preventDefault()
    setDragging(true)
    dragStartX.current = e.clientX
    dragStartWidth.current = width
  }

  const onDragMove = useCallback(
    (e) => {
      if (!dragging) return
      const next = dragStartWidth.current + (e.clientX - dragStartX.current)
      setPrefs((p) => ({
        ...p,
        width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)),
      }))
    },
    [dragging],
  )

  const onDragEnd = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
    }
  }, [dragging, onDragMove, onDragEnd])

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        style={{ width: undefined }}
        className={`fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:w-auto`}
      >
        {/* Desktop width controlled via style */}
        <div
          className="relative hidden h-full flex-col lg:flex"
          style={{ width: desktopWidth, transition: dragging ? 'none' : 'width 0.2s ease' }}
        >
          <div className={`flex items-center gap-2 py-5 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold brand-text leading-none">UrbanEase</p>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>

          <nav className={`flex-1 space-y-1 overflow-y-auto py-2 ${collapsed ? 'px-2' : 'px-3'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `relative flex items-center rounded-xl py-2.5 text-sm font-medium ${
                    collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                  } ${isActive ? 'brand-gradient text-white' : 'text-slate-600 hover:bg-slate-50'}`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.badge && <NotificationBadge count={unreadCount} collapsed={collapsed} />}
              </NavLink>
            ))}
          </nav>

          <div className={`mt-auto border-t border-slate-100 ${collapsed ? 'p-2' : 'p-3'}`}>
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`mb-1 flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              }`}
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

          {/* Drag handle */}
          {!collapsed && (
            <button
              type="button"
              aria-label="Resize sidebar"
              onMouseDown={onDragStart}
              className={`absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize border-0 bg-transparent transition-colors hover:bg-black/10 ${
                dragging ? 'bg-black/15' : ''
              }`}
            />
          )}
        </div>

        {/* Mobile sidebar (fixed width) */}
        <div className="flex h-full w-64 flex-col lg:hidden">
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
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'brand-gradient text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon className="h-5 w-5" /> {item.label}
                {item.badge && <NotificationBadge count={unreadCount} collapsed={false} />}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-8">
          <button type="button" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50 lg:inline-flex"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
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
