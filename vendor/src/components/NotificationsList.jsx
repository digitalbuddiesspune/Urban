import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2, ArrowRight } from 'lucide-react'

const SEVERITY = {
  urgent: {
    unread: 'border-red-200 bg-red-50 hover:border-red-300',
    badge: 'bg-red-600 text-white',
    icon: 'text-red-600',
  },
  warning: {
    unread: 'border-amber-200 bg-amber-50 hover:border-amber-300',
    badge: 'bg-amber-600 text-white',
    icon: 'text-amber-600',
  },
  info: {
    unread: 'border-slate-200 bg-slate-50 hover:border-slate-300',
    badge: 'bg-slate-800 text-white',
    icon: 'text-slate-600',
  },
}

const formatWhen = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const NotificationsList = ({ notifications = [] }) => {
  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Last 3 days</h2>
        </div>
        {notifications.length === 0 ? (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> No notifications in the last 3 days
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            {notifications.length} total
            {unread > 0 ? ` · ${unread} unread` : ' · all read'}
          </span>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-4 space-y-3">
          {notifications.map((n) => {
            const styles = SEVERITY[n.severity] || SEVERITY.info
            const unreadItem = !n.isRead
            return (
              <Link
                key={n._id}
                to={n.link || '/'}
                className={`flex items-start justify-between gap-3 rounded-xl border p-4 transition ${
                  unreadItem
                    ? styles.unread
                    : 'border-slate-100 bg-white opacity-70 hover:opacity-100'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {unreadItem && n.severity === 'urgent' && (
                      <AlertTriangle className={`h-4 w-4 shrink-0 ${styles.icon}`} />
                    )}
                    <p className="font-medium text-slate-800">{n.title}</p>
                    {unreadItem && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles.badge}`}>
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{n.message}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{formatWhen(n.createdAt)}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsList
