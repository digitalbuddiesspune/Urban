import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Star,
  Clock,
  ChevronLeft,
  BadgeCheck,
  ShoppingCart,
  Check,
  Trash2,
} from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import { formatCurrency } from '../utils/helpers.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ScheduleServiceModal from '../components/ScheduleServiceModal.jsx'

const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900'

const PROMISES = ['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing']

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location } = useLocation()
  const { items, count, total, addItem, removeItem, isInCart } = useCart()

  const [service, setService] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(id)
  const [scheduleService, setScheduleService] = useState(null)
  const [adding, setAdding] = useState(false)
  const [proceedAfterAdd, setProceedAfterAdd] = useState(false)

  useEffect(() => {
    setActiveId(id)
    setLoading(true)

    const params = new URLSearchParams()
    if (location?.lat != null && location?.lng != null) {
      params.set('lat', String(location.lat))
      params.set('lng', String(location.lng))
    }
    const q = params.toString()

    api
      .get(`/user/services/${id}${q ? `?${q}` : ''}`)
      .then(async (r) => {
        const s = r.data.service
        setService(s)
        // Backend may return the nearest vendor's variant of this service.
        setActiveId(String(s._id))
        const categoryId = s.categoryId?._id || s.categoryId
        if (!categoryId) {
          setSiblings([s])
          return
        }
        const listParams = new URLSearchParams({ category: String(categoryId), limit: '50' })
        if (location?.lat != null && location?.lng != null) {
          listParams.set('lat', String(location.lat))
          listParams.set('lng', String(location.lng))
        }
        const list = await api.get(`/user/services?${listParams.toString()}`)
        const services = list.data.services || []

        // Same service offered by multiple vendors → keep only the nearest one.
        const byTitle = new Map()
        for (const item of services) {
          const key = (item.title || '').trim().toLowerCase()
          const existing = byTitle.get(key)
          const isCurrent = String(item._id) === String(s._id)
          if (!existing) {
            byTitle.set(key, item)
            continue
          }
          const existingIsCurrent = String(existing._id) === String(s._id)
          if (existingIsCurrent) continue
          if (
            isCurrent ||
            (item.distanceKm != null &&
              (existing.distanceKm == null || item.distanceKm < existing.distanceKm))
          ) {
            byTitle.set(key, item)
          }
        }
        const deduped = [...byTitle.values()]
        const hasCurrent = deduped.some((item) => String(item._id) === String(s._id))
        setSiblings(hasCurrent ? deduped : [s, ...deduped])
      })
      .catch(() => {
        setService(null)
        setSiblings([])
      })
      .finally(() => setLoading(false))
  }, [id, location])

  const activeService = useMemo(
    () => siblings.find((s) => String(s._id) === String(activeId)) || service,
    [siblings, activeId, service]
  )

  const categoryName = service?.categoryId?.name || 'Services'

  const requireLogin = () => {
    toast.error('Please login to add to cart')
    navigate('/login', { state: { from: { pathname: `/services/${id}` } } })
  }

  const handleRequestAdd = (svc) => {
    if (!user) {
      requireLogin()
      return
    }
    if (isInCart(svc._id)) {
      toast.success('Already in cart')
      return
    }
    setProceedAfterAdd(false)
    setScheduleService(svc)
  }

  const handleProceedToBook = (svc) => {
    if (!user) {
      requireLogin()
      return
    }
    const cartItem = items.find((i) => String(i.serviceId) === String(svc._id))
    if (cartItem?.bookingDate && cartItem?.bookingTime) {
      navigate(`/book/${svc._id}`, { state: { fromCart: true, bookAll: false } })
      return
    }
    setProceedAfterAdd(true)
    setScheduleService(svc)
  }

  const handleConfirmSchedule = async ({ bookingDate, bookingTime }) => {
    if (!scheduleService) return
    const shouldProceed = proceedAfterAdd
    const serviceId = scheduleService._id
    setAdding(true)
    try {
      const result = await addItem(scheduleService, { bookingDate, bookingTime })
      if (!result.ok) {
        toast.error(result.error || 'Could not add to cart')
        return
      }
      toast.success(result.alreadyInCart ? 'Schedule updated in cart' : 'Added to cart')
      setScheduleService(null)
      setProceedAfterAdd(false)
      if (shouldProceed) {
        navigate(`/book/${serviceId}`, { state: { fromCart: true, bookAll: false } })
      }
    } finally {
      setAdding(false)
    }
  }

  const relatedServices = useMemo(
    () => siblings.filter((s) => String(s._id) !== String(activeService?._id)),
    [siblings, activeService]
  )

  const selectService = (serviceId) => {
    setActiveId(serviceId)
    if (String(serviceId) !== String(id)) {
      navigate(`/services/${serviceId}`, { replace: true })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <PageLoader />
  if (!service || !activeService) {
    return <p className="py-16 text-center text-slate-500">Service not found</p>
  }

  const hasDiscount = activeService.discountPrice > 0
  const price = hasDiscount ? activeService.discountPrice : activeService.price
  const inCart = isInCart(activeService._id)
  const detailBullets = (activeService.description || '')
    .split(/[.\n]/)
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 pb-28 lg:pb-10">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-slate-300">/</span>
          <span className="truncate text-sm font-semibold text-slate-900">{categoryName}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)_280px] lg:gap-6 lg:py-6">
        {/* Left: select a service */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <p className="text-sm font-semibold text-slate-900">Select a service</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
              {siblings.map((svc) => {
                const active = String(svc._id) === String(activeId)
                return (
                  <button
                    key={svc._id}
                    type="button"
                    onClick={() => selectService(svc._id)}
                    className={`flex w-[88px] shrink-0 flex-col items-center rounded-xl border p-2 text-center transition lg:w-full lg:flex-row lg:gap-2.5 lg:p-2 lg:text-left ${
                      active
                        ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-white lg:h-11 lg:w-11">
                      <img
                        src={svc.images?.[0] || FALLBACK}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-snug text-slate-800 lg:mt-0 lg:text-xs">
                      {svc.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Middle: selected detail + related */}
        <section className="min-w-0">
          {/* Selected service detail */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[16/9] w-full bg-slate-100 sm:aspect-[2/1]">
              <img
                src={activeService.images?.[0] || FALLBACK}
                alt={activeService.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-sm font-medium text-violet-600">{categoryName}</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{activeService.title}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-violet-700">
                  <Star className="h-4 w-4 fill-violet-600 text-violet-600" />
                  {activeService.rating > 0 ? Number(activeService.rating).toFixed(2) : 'New'}
                  {activeService.numReviews > 0 ? ` (${activeService.numReviews})` : ''}
                </span>
                {activeService.estimatedTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {activeService.estimatedTime}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(price)}</span>
                    {hasDiscount && (
                      <span className="text-base text-slate-400 line-through">
                        {formatCurrency(activeService.price)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="mt-0.5 text-xs font-medium text-emerald-600">
                      Save {formatCurrency(activeService.price - activeService.discountPrice)}
                    </p>
                  )}
                </div>
                <div className="flex w-full gap-2 sm:w-auto sm:min-w-[260px]">
                  <button
                    type="button"
                    disabled={adding}
                    onClick={() => handleRequestAdd(activeService)}
                    className={`min-h-[46px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-6 ${
                      inCart
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-violet-600 text-violet-700 hover:bg-violet-50'
                    }`}
                  >
                    {inCart ? 'Added' : 'Add'}
                  </button>
                  <button
                    type="button"
                    disabled={adding}
                    onClick={() => handleProceedToBook(activeService)}
                    className="btn-primary min-h-[46px] flex-[1.6] px-3 py-2.5 text-sm sm:flex-1 sm:px-6"
                  >
                    Proceed to book
                  </button>
                </div>
              </div>

              {detailBullets.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {detailBullets.slice(0, 6).map((line) => (
                    <li key={line} className="text-sm text-slate-600">
                      • {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  Professional home service at your doorstep.
                </p>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-violet-50 p-3 text-sm text-slate-700">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                <div>
                  <p>
                    Provided by{' '}
                    <strong>
                      {activeService.vendorId?.businessName || activeService.vendorId?.name || 'Vendor'}
                    </strong>
                    {activeService.vendorId?.city ? ` · ${activeService.vendorId.city}` : ''}
                  </p>
                  {activeService.distanceLabel && (
                    <p className="mt-0.5 text-xs text-slate-600">{activeService.distanceLabel} from you</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related / more services */}
          {relatedServices.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">More services</h2>
              <p className="mt-0.5 text-sm text-slate-500">Related options in {categoryName}</p>

              <ul className="mt-4 space-y-4">
                {relatedServices.map((svc) => {
                  const relDiscount = svc.discountPrice > 0
                  const relPrice = relDiscount ? svc.discountPrice : svc.price
                  const relInCart = isInCart(svc._id)
                  const bullets = (svc.description || '')
                    .split(/[.\n]/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .slice(0, 2)

                  return (
                    <li
                      key={svc._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => selectService(svc._id)}
                            className="text-left text-base font-bold text-slate-900 hover:text-violet-700 sm:text-lg"
                          >
                            {svc.title}
                          </button>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
                            <span className="inline-flex items-center gap-1 font-medium text-violet-700">
                              <Star className="h-3.5 w-3.5 fill-violet-600 text-violet-600" />
                              {svc.rating > 0 ? Number(svc.rating).toFixed(2) : 'New'}
                              {svc.numReviews > 0 ? ` (${svc.numReviews})` : ''}
                            </span>
                            {svc.estimatedTime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {svc.estimatedTime}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-bold text-slate-900">{formatCurrency(relPrice)}</span>
                            {relDiscount && (
                              <span className="text-sm text-slate-400 line-through">
                                {formatCurrency(svc.price)}
                              </span>
                            )}
                          </div>
                          {bullets.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {bullets.map((line) => (
                                <li key={line} className="text-sm text-slate-600">
                                  • {line}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex w-[108px] shrink-0 flex-col items-center sm:w-[120px]">
                          <button
                            type="button"
                            onClick={() => selectService(svc._id)}
                            className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100"
                          >
                            <img
                              src={svc.images?.[0] || FALLBACK}
                              alt={svc.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                          <button
                            type="button"
                            disabled={adding}
                            onClick={() => handleRequestAdd(svc)}
                            className={`mt-2 w-full rounded-lg border px-2 py-1.5 text-sm font-semibold transition ${
                              relInCart
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-violet-600 text-violet-700 hover:bg-violet-50'
                            }`}
                          >
                            {relInCart ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Right: promise + cart */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="absolute -right-2 -top-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-bold uppercase leading-tight text-white shadow-md">
              Quality
              <br />
              Assured
            </div>
            <h3 className="pr-14 text-base font-bold text-slate-900">UrbanEase Promise</h3>
            <ul className="mt-3 space-y-2.5">
              {PROMISES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
            {count === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">No items in your cart</p>
                <p className="mt-1 text-xs text-slate-500">Add a service to get started</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900">
                    Cart · {count} item{count === 1 ? '' : 's'}
                  </h3>
                  <Link to="/cart" className="text-xs font-semibold text-violet-700 hover:underline">
                    View cart
                  </Link>
                </div>
                <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.serviceId} className="flex gap-2 rounded-xl bg-slate-50 p-2">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <img src={item.image || FALLBACK} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-600">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.serviceId)}
                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-slate-800">Total</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(total)}</span>
                </div>
                <Link
                  to={`/book/${items[0].serviceId}`}
                  state={{ fromCart: true, bookAll: true }}
                  className="btn-primary mt-3 flex w-full items-center justify-center py-2.5 text-sm"
                >
                  Proceed to book
                </Link>
              </>
            )}
          </div>

          <div className="hidden items-start gap-2 rounded-xl bg-violet-50 p-3 text-xs text-slate-700 lg:flex">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            Verified pros · Same-day slots · Secure booking
          </div>
        </aside>
      </div>

      {/* Mobile cart bar */}
      {count > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-14 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{count} in cart</p>
              <p className="font-bold text-slate-900">{formatCurrency(total)}</p>
            </div>
            <Link
              to="/cart"
              className="btn-primary min-h-[44px] flex-1 py-2.5 text-center text-sm"
            >
              View cart
            </Link>
          </div>
        </div>
      )}

      <ScheduleServiceModal
        service={scheduleService}
        open={Boolean(scheduleService)}
        onClose={() => {
          setScheduleService(null)
          setProceedAfterAdd(false)
        }}
        onConfirm={handleConfirmSchedule}
        confirmLabel={
          adding ? 'Please wait…' : proceedAfterAdd ? 'Confirm & book' : 'Add to cart'
        }
      />
    </div>
  )
}

export default ServiceDetails
