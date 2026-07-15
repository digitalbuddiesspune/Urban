import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Clock, MapPin, ChevronLeft, BadgeCheck } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import StarRating from '../components/ui/StarRating.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900'

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location } = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (location?.lat != null && location?.lng != null) {
      params.set('lat', String(location.lat))
      params.set('lng', String(location.lng))
    }
    const q = params.toString()
    api
      .get(`/user/services/${id}${q ? `?${q}` : ''}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [id, location])

  if (loading) return <PageLoader />
  if (!data?.service) return <p className="py-16 text-center text-slate-500">Service not found</p>

  const { service, reviews } = data
  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const handleBook = () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/services/${id}` } } })
    navigate(`/book/${id}`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-600">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div>
          <div className="card overflow-hidden">
            <img
              src={service.images?.[0] || FALLBACK}
              alt={service.title}
              className="h-48 w-full object-cover sm:h-56 md:h-64 lg:h-72"
            />
          </div>
          <div className="mt-5 sm:mt-6">
            <p className="text-sm font-medium text-violet-600">{service.categoryId?.name}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{service.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 sm:gap-4">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {service.rating || 'New'} ({service.numReviews || 0})
              </span>
              {service.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {service.estimatedTime}
                </span>
              )}
              {service.serviceArea?.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {service.serviceArea.join(', ')}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              {service.description || 'No description provided.'}
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-violet-50 p-3 sm:mt-6 sm:p-4">
              <BadgeCheck className="h-5 w-5 shrink-0 text-violet-600" />
              <div className="min-w-0 text-sm text-slate-700">
                <p>
                  Provided by <strong>{service.vendorId?.businessName || service.vendorId?.name}</strong>
                  {service.vendorId?.city ? ` · ${service.vendorId.city}` : ''}
                </p>
                {service.distanceLabel && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-600">
                    <MapPin className="h-3.5 w-3.5" /> {service.distanceLabel} from you
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <h2 className="text-lg font-bold text-slate-900">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="card p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-slate-800">{r.userId?.name || 'User'}</span>
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <div className="mt-1">
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
          <div className="card p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{formatCurrency(price)}</span>
              {service.discountPrice > 0 && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(service.price)}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Inclusive of all charges</p>
            <button onClick={handleBook} className="btn-primary mt-5 w-full py-3">
              Book this service
            </button>
            <Link to="/services" className="mt-3 block text-center text-sm font-medium text-violet-700">
              Browse more services
            </Link>
          </div>
        </div>
      </div>

      <div className="safe-bottom fixed bottom-14 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur lg:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="min-w-0 shrink-0">
            <p className="text-xs text-slate-500">From</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(price)}</p>
          </div>
          <button onClick={handleBook} className="btn-primary min-h-[44px] flex-1 py-3">
            Book this service
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
