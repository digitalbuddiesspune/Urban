import { useEffect, useState } from 'react'
import api from '../../api/axios.js'
import { useLocation } from '../../context/LocationContext.jsx'
import { appendLocationParams } from '../../utils/helpers.js'
import ServiceRail from './ServiceRail.jsx'

const PopularServices = () => {
  const { location } = useLocation()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams({ limit: '12' })
    appendLocationParams(params, location)
    if (location?.lat != null && location?.lng != null) {
      params.set('sort', 'nearest')
    } else {
      params.set('sort', 'rating')
    }

    api
      .get(`/user/services?${params.toString()}`)
      .then((r) => {
        if (!cancelled) setServices(r.data.services || [])
      })
      .catch(() => {
        if (!cancelled) setServices([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [location?.lat, location?.lng, location?.city, location?.updatedAt])

  if (loading || !services.length) return null

  const heading =
    location?.source === 'city' && location.label
      ? `Services in ${location.label}`
      : location
        ? 'Nearest services'
        : 'Most booked services'

  return (
    <section id="services" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">{heading}</h2>
        {location && services[0]?.distanceLabel && (
          <p className="shrink-0 text-xs text-slate-500 sm:text-sm">
            Closest {services[0].distanceLabel} away
          </p>
        )}
      </div>
      <ServiceRail services={services} />
    </section>
  )
}

export default PopularServices
