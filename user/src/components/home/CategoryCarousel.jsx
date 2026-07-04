import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const CAT_FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'

const CATEGORY_IMAGES = {
  'AC Repair': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  Electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  Plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
  'Home Cleaning': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'Salon at Home': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
}

const getCategoryImage = (cat) => CATEGORY_IMAGES[cat.name] || cat.image || CAT_FALLBACK

const CategoryCarousel = ({ categories }) => {
  const carouselRef = useRef(null)

  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (!categories?.length) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">What we offer</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">Browse by category</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-black hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-black hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/services?category=${cat._id}`}
            className="group relative block aspect-[4/3] w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[55%] md:w-[38%] lg:w-[30%] xl:w-[23%]"
          >
            <img
              src={getCategoryImage(cat)}
              alt={cat.name}
              loading="lazy"
              onError={(e) => {
                if (!e.currentTarget.src.includes(CAT_FALLBACK)) e.currentTarget.src = CAT_FALLBACK
              }}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <div>
                <h3 className="text-base font-semibold text-white">{cat.name}</h3>
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-white/70 opacity-0 transition group-hover:opacity-100">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <span className="flex h-9 w-9 shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategoryCarousel
