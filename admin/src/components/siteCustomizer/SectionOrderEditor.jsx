import { GripVertical } from 'lucide-react'

const SECTION_META = {
  hero: { label: 'Hero banner', h: 'h-28' },
  categories: { label: 'Browse by category', h: 'h-20' },
  popular: { label: 'Most booked services', h: 'h-24' },
  testimonials: { label: 'Testimonials', h: 'h-16' },
}

const SectionOrderEditor = ({ sections, onReorder, dragIdx, setDragIdx }) => {
  const move = (from, to) => {
    if (from === to || from == null) return
    const next = [...sections]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onReorder(next)
    setDragIdx(null)
  }

  return (
    <div className="mx-auto max-w-xs">
      <p className="mb-3 text-center text-xs text-slate-500">Drag sections up or down to reorder the home page</p>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-500">Navbar</div>
        <ul className="space-y-2">
          {sections.map((key, i) => {
            const meta = SECTION_META[key] || { label: key, h: 'h-16' }
            return (
              <li
                key={key}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => move(dragIdx, i)}
                onDragEnd={() => setDragIdx(null)}
                className={`flex cursor-grab items-center gap-2 rounded-xl border bg-gradient-to-r from-slate-50 to-white px-3 py-2 active:cursor-grabbing ${
                  dragIdx === i ? 'border-black opacity-60' : 'border-slate-200'
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800">{meta.label}</p>
                  <div className={`mt-1 rounded-md bg-slate-200/80 ${meta.h}`} />
                </div>
              </li>
            )
          })}
        </ul>
        <div className="mt-2 rounded-lg bg-black px-3 py-2 text-center text-xs font-medium text-white">Footer</div>
      </div>
    </div>
  )
}

export default SectionOrderEditor
