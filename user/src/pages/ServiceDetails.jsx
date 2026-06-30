import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, Clock, MapPin, ChevronLeft, BadgeCheck } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import StarRating from '../components/ui/StarRating.jsx'
import { formatCurrency, formatDate } from '../utils/helpers.js'
import { useAuth } from '../context/AuthContext.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900'

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/user/services/${id}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!data?.service) return <p className="py-16 text-center text-slate-500">Service not found</p>

  const { service, reviews } = data
  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const handleBook = () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/services/${id}` } } })
    navigate(`/book/${id}`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-600">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="card overflow-hidden">
            <img src={service.images?.[0] || FALLBACK} alt={service.title} className="h-72 w-full object-cover" />
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-violet-600">{service.categoryId?.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{service.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
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
            <p className="mt-4 leading-relaxed text-slate-600">{service.description || 'No description provided.'}</p>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-violet-50 p-4">
              <BadgeCheck className="h-5 w-5 text-violet-600" />
              <span className="text-sm text-slate-700">
                Provided by <strong>{service.vendorId?.businessName || service.vendorId?.name}</strong>
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="card p-4">
                    <div className="flex items-center justify-between">
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

        <div className="lg:sticky lg:top-24 lg:h-fit">
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
    </div>
  )
}

export default ServiceDetails
