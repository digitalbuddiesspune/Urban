import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2, ArrowRight } from 'lucide-react'

const SEVERITY = {
  urgent: {
    active: 'border-red-200 bg-red-50 hover:border-red-300',
    badge: 'bg-red-600 text-white',
    icon: 'text-red-600',
  },
  warning: {
    active: 'border-amber-200 bg-amber-50 hover:border-amber-300',
    badge: 'bg-amber-600 text-white',
    icon: 'text-amber-600',
  },
  info: {
    active: 'border-slate-200 bg-slate-50 hover:border-slate-300',
    badge: 'bg-slate-800 text-white',
    icon: 'text-slate-600',
  },
}

const AlertsPanel = ({ alerts = [] }) => {
  const activeCount = alerts.filter((a) => a.count > 0).length
  const attentionTotal = alerts.reduce((sum, a) => sum + (a.count > 0 ? a.count : 0), 0)

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h2 className="font-semibold text-slate-800">Alerts</h2>
        </div>
        {activeCount === 0 ? (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" /> All clear — nothing needs attention
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            {activeCount} alert types · {attentionTotal} total items
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {alerts.map((alert) => {
          const styles = SEVERITY[alert.severity] || SEVERITY.info
          const isActive = alert.count > 0
          return (
            <Link
              key={alert.id}
              to={alert.link}
              className={`flex items-start justify-between gap-3 rounded-xl border p-4 transition ${
                isActive ? styles.active : 'border-slate-100 bg-white opacity-50 hover:opacity-70'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {isActive && alert.severity === 'urgent' && (
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${styles.icon}`} />
                  )}
                  <p className="font-medium text-slate-800">{alert.title}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isActive ? styles.badge : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {alert.count}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default AlertsPanel
