import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StarRating from '../components/ui/StarRating.jsx'
import { formatDate } from '../utils/helpers.js'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/vendor/reviews')
      .then((r) => setReviews(r.data.reviews))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reviews & ratings</h1>
      <p className="text-sm text-slate-500">What customers say about your services</p>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" subtitle="Customer reviews will appear here after completed bookings." icon={Star} />
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{r.userId?.name}</p>
                  <p className="text-xs text-slate-400">{r.serviceId?.title}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
              </div>
              <div className="mt-2">
                <StarRating value={r.rating} size={16} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
