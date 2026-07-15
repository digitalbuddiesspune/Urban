import { useEffect, useState } from 'react'
import api from '../../api/axios.js'
import ServiceRail from './ServiceRail.jsx'

const PopularServices = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/user/services?sort=rating&limit=12')
      .then((r) => setServices(r.data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !services.length) return null

  return (
    <section id="services" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <h2 className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">Most booked services</h2>
      <ServiceRail services={services} />
    </section>
  )
}

export default PopularServices
