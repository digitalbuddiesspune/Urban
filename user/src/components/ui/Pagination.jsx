import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-9 w-9 rounded-lg text-sm font-medium ${
            p === page ? 'btn-primary' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Pagination
