import { Star } from 'lucide-react'

const StarRating = ({ value = 0, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        style={{ width: size, height: size }}
        className={s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
      />
    ))}
  </div>
)

export default StarRating
