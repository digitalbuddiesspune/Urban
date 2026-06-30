import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Star, Trash2 } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import StarRating from '../components/ui/StarRating.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { formatDate } from '../utils/helpers.js'

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/admin/reviews')
      .then((r) => setReviews(r.data.reviews))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/reviews/${delTarget}`)
      toast.success('Review deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reviews & complaints</h1>
      <p className="text-sm text-slate-500">Monitor and moderate customer reviews</p>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" subtitle="Customer reviews will appear here." icon={Star} />
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="card flex items-start justify-between p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-800">{r.userId?.name}</span>
                  <StarRating value={r.rating} size={14} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {r.serviceId?.title} · {r.vendorId?.businessName || r.vendorId?.name} · {formatDate(r.createdAt)}
                </p>
                {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
              </div>
              <button onClick={() => setDelTarget(r._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!delTarget}
        title="Delete review?"
        message="This review will be permanently removed."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Reviews
