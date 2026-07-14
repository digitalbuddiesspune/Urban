import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CAT_FALLBACK, getCategoryImage } from '../utils/categoryImages.js'

const CategoryCard = ({ category, variant = 'grid' }) => {
  const isCarousel = variant === 'carousel'

  return (
    <Link
      to={`/services?category=${category._id}`}
      className={`group relative block overflow-hidden border border-slate-100 shadow-sm transition duration-300 hover:shadow-xl ${
        isCarousel
          ? 'aspect-[4/5] w-[42%] shrink-0 snap-start rounded-xl sm:aspect-[4/3] sm:w-[55%] sm:rounded-2xl md:w-[38%] lg:w-[30%] xl:w-[23%]'
          : 'aspect-[4/3]'
      }`}
      style={!isCarousel ? { borderRadius: 'var(--theme-card-radius)' } : undefined}
    >
      <img
        src={getCategoryImage(category)}
        alt={category.name}
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.src.includes(CAT_FALLBACK)) e.currentTarget.src = CAT_FALLBACK
        }}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
        <div>
          <h3 className="text-sm font-semibold text-white sm:text-base">{category.name}</h3>
          {!isCarousel && category.description && (
            <p className="mt-1 line-clamp-2 text-xs text-white/75">{category.description}</p>
          )}
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/70 opacity-0 transition group-hover:opacity-100">
            View service <ArrowRight className="h-3 w-3" />
          </span>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:opacity-100">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default CategoryCard
