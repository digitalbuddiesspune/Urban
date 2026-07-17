export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  )

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

/** Append lat/lng/city from browsing location onto URLSearchParams */
export const appendLocationParams = (params, location) => {
  if (!location) return params
  if (location.lat != null && location.lng != null) {
    params.set('lat', String(location.lat))
    params.set('lng', String(location.lng))
  }
  if (location.city) params.set('city', location.city)
  return params
}

/** Display "09:00" / "14:00" as "9:00 AM" / "2:00 PM" */
export const formatTime = (time) => {
  if (!time) return ''
  const trimmed = String(time).trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return trimmed
  let hour = Number(match[1])
  const minute = match[2]
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return trimmed
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour}:${minute} ${period}`
}

// Monochrome status styles: distinguished by light/dark shade and border.
export const STATUS_STYLES = {
  pending: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  accepted: 'bg-slate-200 text-slate-800',
  rejected: 'bg-slate-900 text-white',
  on_the_way: 'bg-slate-300 text-slate-900',
  in_progress: 'bg-slate-700 text-white',
  completed: 'bg-black text-white',
  cancelled: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
  paid: 'bg-black text-white',
  failed: 'bg-slate-900 text-white',
  refunded: 'bg-slate-200 text-slate-700',
  approved: 'bg-black text-white',
  active: 'bg-slate-200 text-slate-800',
  blocked: 'bg-slate-900 text-white',
}

export const statusLabel = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
