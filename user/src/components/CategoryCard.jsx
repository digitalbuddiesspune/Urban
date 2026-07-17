import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CAT_FALLBACK, getCategoryImage } from '../utils/categoryImages.js'

const CategoryCard = ({ category, variant = 'grid' }) => {
  const isCarousel = variant === 'carousel'

  if (isCarousel) {
    return (
      <Link
        to={`/services?category=${category._id}`}
        className="group relative block aspect-[4/5] w-[42%] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-100 shadow-sm transition duration-300 hover:shadow-xl sm:aspect-[4/3] sm:w-[55%] sm:rounded-2xl md:w-[38%] lg:w-[30%] xl:w-[23%]"
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
          <h3 className="text-sm font-semibold text-white sm:text-base">{category.name}</h3>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:opacity-100">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/services?category=${category._id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="aspect-[16/11] overflow-hidden bg-slate-100">
        <img
          src={getCategoryImage(category)}
          alt={category.name}
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.includes(CAT_FALLBACK)) e.currentTarget.src = CAT_FALLBACK
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">{category.name}</h3>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-violet-600 group-hover:text-white">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
