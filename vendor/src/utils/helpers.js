export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  )

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  on_the_way: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
}

export const statusLabel = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const BOOKING_FLOW = ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed']
