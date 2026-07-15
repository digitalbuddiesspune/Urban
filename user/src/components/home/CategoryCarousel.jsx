import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CategoryCard from '../CategoryCard.jsx'

const CategoryCarousel = ({ categories }) => {
  const carouselRef = useRef(null)

  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (!categories?.length) return null

  return (
    <section id="categories" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">What we offer</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">Browse by category</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-black hover:text-white sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-black hover:text-white sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:mt-8 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => (
          <CategoryCard key={cat._id} category={cat} variant="carousel" />
        ))}
      </div>
    </section>
  )
}

export default CategoryCarousel
