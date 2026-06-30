import { Star } from 'lucide-react'

const StarRating = ({ value = 0, size = 16, onChange }) => {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            style={{ width: size, height: size }}
            className={s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRating
