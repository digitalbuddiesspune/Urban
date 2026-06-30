import { STATUS_STYLES, statusLabel } from '../../utils/helpers.js'

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'
    }`}
  >
    {statusLabel(status)}
  </span>
)

export default StatusBadge
