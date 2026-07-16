import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapPin, Plus, ChevronLeft } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import { formatCurrency, formatDate, formatTime } from '../utils/helpers.js'
import { useCart } from '../context/CartContext.jsx'
import ScheduleServiceModal from '../components/ScheduleServiceModal.jsx'

const emptyAddr = { label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' }
const FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'

const Booking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromCart = location.state?.fromCart || false
  const bookAll = Boolean(location.state?.bookAll)
  const { items, removeItem, isInCart, total: cartTotal, clearCart, updateSchedule, addItem } = useCart()
  const singleCartItem = items.find((i) => String(i.serviceId) === String(id))

  const [service, setService] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [scheduleOverrides, setScheduleOverrides] = useState({})

  const [form, setForm] = useState({
    paymentMethod: 'cash',
  })
  const [selectedAddr, setSelectedAddr] = useState(null)
  const [newAddr, setNewAddr] = useState(emptyAddr)
  const [useNew, setUseNew] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/user/services/${id}`), api.get('/user/addresses')])
      .then(([s, a]) => {
        setService(s.data.service)
        setAddresses(a.data.addresses)
        if (a.data.addresses.length > 0) setSelectedAddr(a.data.addresses[0]._id)
        else setUseNew(true)
      })
      .catch(() => toast.error('Could not load booking details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!service) return <p className="py-16 text-center text-slate-500">Service not found</p>

  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const applyScheduleOverride = (item) => {
    const key = String(item.serviceId)
    const override = scheduleOverrides[key]
    if (!override) return item
    return {
      ...item,
      bookingDate: override.bookingDate ?? item.bookingDate,
      bookingTime: override.bookingTime ?? item.bookingTime,
    }
  }

  const summaryItems = (
    bookAll && items.length > 0
      ? items
      : [
          singleCartItem || {
            serviceId: service._id,
            title: service.title,
            image: service.images?.[0] || '',
            price,
            categoryName: service.categoryId?.name || '',
            discountPrice: service.discountPrice || 0,
            bookingDate: '',
            bookingTime: '',
          },
        ]
  ).map(applyScheduleOverride)

  const orderTotal = bookAll && items.length > 0
    ? cartTotal
    : singleCartItem?.price ?? price

  const hasSchedule = (item) => Boolean(item?.bookingDate && item?.bookingTime)
  const scheduleReady = summaryItems.every(hasSchedule)
  const missingScheduleItem = summaryItems.find((item) => !hasSchedule(item))

  const submit = async (e) => {
    e.preventDefault()

    const servicesToBook =
      bookAll && items.length > 0
        ? items.map(applyScheduleOverride)
        : [
            applyScheduleOverride({
              serviceId: id,
              title: service.title,
              bookingDate: singleCartItem?.bookingDate || '',
              bookingTime: singleCartItem?.bookingTime || '',
            }),
          ]

    const missingSchedule = servicesToBook.find((item) => !item.bookingDate || !item.bookingTime)
    if (missingSchedule) {
      const target =
        summaryItems.find((i) => String(i.serviceId) === String(missingSchedule.serviceId)) ||
        missingScheduleItem
      if (target) setEditingItem(target)
      return toast.error(
        missingSchedule.title
          ? `Please select date & time for "${missingSchedule.title}"`
          : 'Please select date & time before booking'
      )
    }

    let address
    if (useNew) {
      if (!newAddr.line1 || !newAddr.city || !newAddr.pincode)
        return toast.error('Please fill the address details')
      address = newAddr
    } else {
      const found = addresses.find((a) => a._id === selectedAddr)
      if (!found) return toast.error('Please select an address')
      address = found
    }

    setSubmitting(true)
    try {
      if (useNew) {
        await api.post('/user/addresses', newAddr)
      }

      for (const item of servicesToBook) {
        await api.post('/user/bookings', {
          serviceId: item.serviceId,
          bookingDate: item.bookingDate,
          bookingTime: item.bookingTime,
          address,
          paymentMethod: form.paymentMethod,
          userNote: '',
        })
      }

      if (bookAll && items.length > 0) {
        await clearCart()
      } else if (isInCart(id)) {
        await removeItem(id)
      }

      toast.success(
        servicesToBook.length > 1
          ? `${servicesToBook.length} bookings confirmed!`
          : 'Booking confirmed!'
      )
      navigate('/bookings')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const paymentOptions = (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {[
        { id: 'cash', label: 'Cash on service' },
        { id: 'online', label: 'Pay online' },
      ].map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setForm({ ...form, paymentMethod: m.id })}
          className={`min-h-[42px] rounded-xl border px-2 py-2 text-xs font-semibold sm:text-sm ${
            form.paymentMethod === m.id
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )

  const orderSummary = (
    <div className="card p-5">
      <h2 className="font-semibold text-slate-800">Order summary</h2>
      <ul className="mt-4 space-y-4">
        {summaryItems.map((item) => (
          <li key={item.serviceId} className="flex gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <img
                src={item.image || FALLBACK}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  {item.categoryName && (
                    <p className="text-xs text-slate-500">{item.categoryName}</p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-semibold text-slate-900">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {hasSchedule(item) ? (
                  <span className="font-medium text-slate-600">
                    {[item.bookingDate ? formatDate(item.bookingDate) : null, formatTime(item.bookingTime)]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ) : (
                  <span className="font-medium text-amber-600">Date & time not selected</span>
                )}
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="rounded-md bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  {hasSchedule(item) ? 'Change date & time' : 'Select date & time'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between text-sm text-slate-600">
        <span>Taxes & fees</span>
        <span>Included</span>
      </div>
      <div className="my-4 border-t border-slate-100" />
      {paymentOptions}
      {!scheduleReady && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Select date & time before confirming booking.
        </p>
      )}
      <div className="mt-4 flex justify-between font-bold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(orderTotal)}</span>
      </div>
      <button
        type="submit"
        disabled={submitting || !scheduleReady}
        className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Spinner className="h-4 w-4" />} Confirm booking
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {fromCart ? (
        <Link
          to="/cart"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back to cart
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}

      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Confirm your booking</h1>
      {bookAll && items.length > 1 && (
        <p className="mt-0.5 text-sm text-slate-500">{items.length} services from your cart</p>
      )}

      <form onSubmit={submit} className="mt-5 grid items-start gap-6 lg:mt-6 lg:grid-cols-[1fr_340px]">
        <div className="order-2 space-y-5 sm:space-y-6 lg:order-1">
          <div className="card p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <MapPin className="h-4 w-4" /> Service address
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNew(!useNew)}
                  className="flex items-center gap-1 self-start text-sm font-medium text-violet-700 sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> {useNew ? 'Use saved' : 'New address'}
                </button>
              )}
            </div>

            {!useNew ? (
              <div className="mt-3 space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                      selectedAddr === a._id ? 'border-violet-500 bg-violet-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addr"
                      checked={selectedAddr === a._id}
                      onChange={() => setSelectedAddr(a._id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 text-sm">
                      <span className="font-medium text-slate-800">{a.label}</span>
                      <p className="text-slate-500">
                        {a.line1}, {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className="input sm:col-span-2" placeholder="Address line 1" value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} />
                <input className="input sm:col-span-2" placeholder="Address line 2 (optional)" value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} />
                <input className="input" placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                <input className="input" placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
                <input className="input sm:col-span-2" placeholder="Pincode" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
              </div>
            )}
          </div>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2">{orderSummary}</div>
      </form>

      <ScheduleServiceModal
        key={editingItem?.serviceId || 'closed'}
        service={
          editingItem
            ? {
                _id: editingItem.serviceId,
                title: editingItem.title,
                images: [editingItem.image || service?.images?.[0]],
                price: editingItem.price ?? price,
                discountPrice: editingItem.discountPrice || 0,
              }
            : null
        }
        open={Boolean(editingItem)}
        initialDate={
          scheduleOverrides[String(editingItem?.serviceId)]?.bookingDate ||
          items.find((i) => String(i.serviceId) === String(editingItem?.serviceId))?.bookingDate ||
          editingItem?.bookingDate ||
          ''
        }
        initialTime={
          scheduleOverrides[String(editingItem?.serviceId)]?.bookingTime ||
          items.find((i) => String(i.serviceId) === String(editingItem?.serviceId))?.bookingTime ||
          editingItem?.bookingTime ||
          ''
        }
        confirmLabel={hasSchedule(editingItem || {}) ? 'Update' : 'Confirm'}
        onClose={() => setEditingItem(null)}
        onConfirm={async ({ bookingDate, bookingTime }) => {
          if (!editingItem) return
          const serviceId = editingItem.serviceId
          try {
            setScheduleOverrides((prev) => ({
              ...prev,
              [String(serviceId)]: { bookingDate, bookingTime },
            }))

            if (isInCart(serviceId)) {
              await updateSchedule(serviceId, { bookingDate, bookingTime })
            } else {
              const result = await addItem(
                {
                  _id: serviceId,
                  title: editingItem.title || service.title,
                  images: [editingItem.image || service.images?.[0]].filter(Boolean),
                  price: editingItem.price ?? service.price,
                  discountPrice: editingItem.discountPrice || service.discountPrice || 0,
                  categoryId: service.categoryId,
                },
                { bookingDate, bookingTime }
              )
              if (!result.ok) throw new Error(result.error || 'Could not save schedule')
            }

            toast.success('Date & time saved')
            setEditingItem(null)
          } catch (err) {
            toast.error(err.message || 'Could not update schedule')
          }
        }}
      />
    </div>
  )
}

export default Booking
