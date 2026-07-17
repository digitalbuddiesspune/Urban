import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronRight, Star, Zap } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import ScheduleServiceModal from '../ScheduleServiceModal.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

export const ServiceRailCard = ({ service, showInstant = true, onRequestAdd }) => {
  const { isInCart } = useCart()
  const hasDiscount = service.discountPrice > 0
  const price = hasDiscount ? service.discountPrice : service.price
  const discountPct = hasDiscount
    ? Math.round(((service.price - service.discountPrice) / service.price) * 100)
    : 0
  const rating = service.rating > 0 ? Number(service.rating).toFixed(2) : null
  const detailPath = `/services/${service._id}`
  const inCart = isInCart(service._id)

  return (
    <div className="group w-[calc((100%-0.875rem)/2.15)] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:w-[calc((100%-2.25rem)/3.2)] lg:w-[calc((100%-4rem)/5)]">
      <Link to={detailPath} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={service.images?.[0] || FALLBACK}
            alt={service.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {discountPct > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {discountPct}% off
            </span>
          )}
          {rating && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
        </div>
        <div className="px-3 pt-2.5">
          {showInstant && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
              <Zap className="h-3 w-3 fill-emerald-600" />
              Instant
            </span>
          )}
          <h3 className="mt-0.5 line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-snug text-slate-900 sm:text-sm">
            {service.title}
          </h3>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1.5">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-slate-900">{formatCurrency(price)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-slate-400 line-through">
              {formatCurrency(service.price)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRequestAdd(service)
          }}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            inCart
              ? 'border border-emerald-600 bg-emerald-50 text-emerald-700'
              : 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
          }`}
        >
          {inCart ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  )
}

const ServiceRail = ({ services, showInstant = true }) => {
  const carouselRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scheduleService, setScheduleService] = useState(null)
  const { addItem } = useCart()

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

  const requireLogin = () => {
    toast.error('Please login to add to cart')
    navigate('/login', {
      state: { from: { pathname: location.pathname, search: location.search } },
    })
  }

  const handleRequestAdd = (service) => {
    if (!user) {
      requireLogin()
      return
    }
    setScheduleService(service)
  }

  const handleConfirmSchedule = async ({ bookingDate, bookingTime }) => {
    if (!user) {
      requireLogin()
      return
    }
    const result = await addItem(scheduleService, { bookingDate, bookingTime })
    if (!result.ok) {
      toast.error(result.error || 'Could not add to cart')
      return
    }
    toast.success(result.alreadyInCart ? 'Schedule updated in cart' : 'Added to cart')
    setScheduleService(null)
  }

  if (!services?.length) return null

  return (
    <>
      <div className="relative mt-4 sm:mt-5">
        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-1 sm:gap-3 lg:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service) => (
            <ServiceRailCard
              key={service._id}
              service={service}
              showInstant={showInstant}
              onRequestAdd={handleRequestAdd}
            />
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

      <ScheduleServiceModal
        service={scheduleService}
        open={Boolean(scheduleService)}
        onClose={() => setScheduleService(null)}
        onConfirm={handleConfirmSchedule}
      />
    </>
  )
}

export default ServiceRail
