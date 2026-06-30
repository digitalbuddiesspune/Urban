import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import { formatCurrency } from '../utils/helpers.js'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const emptyAddr = { label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' }

const Booking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    bookingDate: '',
    bookingTime: '',
    paymentMethod: 'cash',
    userNote: '',
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
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!service) return <p className="py-16 text-center text-slate-500">Service not found</p>

  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const submit = async (e) => {
    e.preventDefault()
    if (!form.bookingDate || !form.bookingTime) return toast.error('Please choose date and time')

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
      await api.post('/user/bookings', {
        serviceId: id,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        address,
        paymentMethod: form.paymentMethod,
        userNote: form.userNote,
      })
      toast.success('Booking confirmed!')
      navigate('/bookings')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Confirm your booking</h1>
      <p className="text-sm text-slate-500">{service.title}</p>

      <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Calendar className="h-4 w-4" /> Select date
            </h2>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="input mt-3"
              value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
            />
            <h2 className="mt-5 flex items-center gap-2 font-semibold text-slate-800">
              <Clock className="h-4 w-4" /> Select time
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, bookingTime: t })}
                  className={`rounded-lg border py-2 text-sm font-medium ${
                    form.bookingTime === t
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <MapPin className="h-4 w-4" /> Service address
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNew(!useNew)}
                  className="flex items-center gap-1 text-sm font-medium text-violet-700"
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
                    <div className="text-sm">
                      <span className="font-medium text-slate-800">{a.label}</span>
                      <p className="text-slate-500">
                        {a.line1}, {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input className="input col-span-2" placeholder="Address line 1" value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} />
                <input className="input col-span-2" placeholder="Address line 2 (optional)" value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} />
                <input className="input" placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                <input className="input" placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
                <input className="input" placeholder="Pincode" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-800">Payment method</h2>
            <div className="mt-3 flex gap-3">
              {['cash', 'online'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: m })}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize ${
                    form.paymentMethod === m
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {m === 'cash' ? 'Cash on service' : 'Pay online'}
                </button>
              ))}
            </div>
            <textarea
              className="input mt-4"
              rows={2}
              placeholder="Add a note for the professional (optional)"
              value={form.userNote}
              onChange={(e) => setForm({ ...form, userNote: e.target.value })}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-slate-600">
              <span>{service.title}</span>
              <span>{formatCurrency(price)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-600">
              <span>Taxes & fees</span>
              <span>Included</span>
            </div>
            <div className="my-4 border-t border-slate-100" />
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(price)}</span>
            </div>
            <button disabled={submitting} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3">
              {submitting && <Spinner className="h-4 w-4" />} Confirm booking
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Booking
