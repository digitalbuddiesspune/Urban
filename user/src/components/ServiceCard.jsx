import { Link } from 'react-router-dom'
import { Star, Clock, MapPin } from 'lucide-react'
import { formatCurrency } from '../utils/helpers.js'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const ServiceCard = ({ service, isNearest = false }) => {
  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  return (
    <Link to={`/services/${service._id}`} className="card group overflow-hidden transition hover:shadow-lg">
      <div className="relative h-28 overflow-hidden bg-slate-100 sm:h-40 md:h-44">
        <img
          src={service.images?.[0] || FALLBACK}
          alt={service.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {isNearest ? (
          <span className="absolute left-2 top-2 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2 sm:text-xs">
            Nearest
          </span>
        ) : (
          service.discountPrice > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2 sm:text-xs">
              Save {formatCurrency(service.price - service.discountPrice)}
            </span>
          )
        )}
        {service.distanceLabel && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white sm:bottom-3 sm:right-3 sm:text-xs">
            {service.distanceLabel} away
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] font-medium text-violet-600 sm:text-xs">{service.categoryId?.name}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 sm:mt-1 sm:line-clamp-1 sm:text-base">
          {service.title}
        </h3>
        <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">
          {service.vendorId?.businessName || service.vendorId?.name}
          {service.vendorId?.city ? ` · ${service.vendorId.city}` : ''}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 sm:mt-2 sm:gap-3 sm:text-xs">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5" /> {service.rating || 'New'}
          </span>
          {service.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {service.estimatedTime}
            </span>
          )}
          {service.distanceLabel && (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {service.distanceLabel}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-1 sm:mt-3">
          <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
            <span className="text-sm font-bold text-slate-900 sm:text-lg">{formatCurrency(price)}</span>
            {service.discountPrice > 0 && (
              <span className="text-[10px] text-slate-400 line-through sm:text-sm">{formatCurrency(service.price)}</span>
            )}
          </div>
          <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 sm:px-3 sm:py-1 sm:text-xs">
            Book
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ServiceCard
