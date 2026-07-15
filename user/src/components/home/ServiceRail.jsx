import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Star, Zap } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers.js'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

export const ServiceRailCard = ({ service, showInstant = true }) => {
  const hasDiscount = service.discountPrice > 0
  const price = hasDiscount ? service.discountPrice : service.price
  const rating = service.rating > 0 ? Number(service.rating).toFixed(2) : null

  return (
    <Link
      to={`/services/${service._id}`}
      className="w-[calc((100%-0.875rem)/2.15)] shrink-0 snap-start sm:w-[calc((100%-2.25rem)/3.2)] lg:w-[calc((100%-4rem)/5)]"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={service.images?.[0] || FALLBACK}
          alt={service.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <h3 className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900 sm:text-sm">
        {service.title}
      </h3>
      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500">
        {rating && (
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-slate-400 text-slate-400" />
            {rating}
          </span>
        )}
        {rating && showInstant && <span className="text-slate-300">•</span>}
        {showInstant && (
          <span className="flex items-center gap-0.5 font-medium text-emerald-600">
            <Zap className="h-3 w-3 fill-emerald-600" />
            Instant
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(price)}</span>
        {hasDiscount && (
          <span className="text-xs text-slate-400 line-through">{formatCurrency(service.price)}</span>
        )}
      </div>
    </Link>
  )
}

const ServiceRail = ({ services, showInstant = true }) => {
  const carouselRef = useRef(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = carouselRef.current
    if (!el) return
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [services])

  const scrollNext = () => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' })
  }

  if (!services?.length) return null

  return (
    <div className="relative mt-4 sm:mt-5">
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-1 sm:gap-3 lg:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {services.map((service) => (
          <ServiceRailCard key={service._id} service={service} showInstant={showInstant} />
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={scrollNext}
          aria-label="See more services"
          className="absolute right-0 top-[28%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition hover:bg-slate-50 sm:h-11 sm:w-11"
        >
          <ChevronRight className="h-5 w-5 text-slate-800" />
        </button>
      )}
    </div>
  )
}

export default ServiceRail
