import { Link } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'
import { formatCurrency } from '../utils/helpers.js'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const ServiceCard = ({ service }) => {
  const price = service.discountPrice > 0 ? service.discountPrice : service.price
  return (
    <Link to={`/services/${service._id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-44">
        <img
          src={service.images?.[0] || FALLBACK}
          alt={service.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {service.discountPrice > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            Save {formatCurrency(service.price - service.discountPrice)}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-violet-600">{service.categoryId?.name}</p>
        <h3 className="mt-1 line-clamp-1 font-semibold text-slate-800">{service.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {service.rating || 'New'}
          </span>
          {service.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {service.estimatedTime}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{formatCurrency(price)}</span>
            {service.discountPrice > 0 && (
              <span className="text-sm text-slate-400 line-through">{formatCurrency(service.price)}</span>
            )}
          </div>
          <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Book</span>
        </div>
      </div>
    </Link>
  )
}

export default ServiceCard
