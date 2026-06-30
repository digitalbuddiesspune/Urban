import { Inbox } from 'lucide-react'

const EmptyState = ({ title = 'Nothing here yet', subtitle = '', icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-500">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    {subtitle && <p className="mt-1 max-w-sm text-sm text-slate-500">{subtitle}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState
