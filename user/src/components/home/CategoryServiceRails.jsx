import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios.js'
import ServiceRail from './ServiceRail.jsx'

const CategoryServiceRails = ({ categories }) => {
  const [byCategory, setByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categories?.length) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all(
      categories.map((cat) =>
        api
          .get(`/user/services?category=${cat._id}&sort=rating&limit=12`)
          .then((r) => ({ id: cat._id, services: r.data.services || [] }))
          .catch(() => ({ id: cat._id, services: [] }))
      )
    )
      .then((results) => {
        if (cancelled) return
        const map = {}
        results.forEach(({ id, services }) => {
          if (services.length) map[id] = services
        })
        setByCategory(map)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categories])

  if (loading || !categories?.length) return null

  const sections = categories.filter((cat) => byCategory[cat._id]?.length)
  if (!sections.length) return null

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-4 pt-8 sm:space-y-12 sm:px-6 sm:pt-10">
      {sections.map((cat) => (
        <section key={cat._id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{cat.name}</h2>
              {cat.description ? (
                <p className="mt-0.5 text-sm text-slate-500 sm:text-base">{cat.description}</p>
              ) : (
                <p className="mt-0.5 text-sm text-slate-500 sm:text-base">{cat.name} services</p>
              )}
            </div>
            <Link
              to={`/services?category=${cat._id}`}
              className="shrink-0 rounded-lg border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              See all
            </Link>
          </div>
          <ServiceRail services={byCategory[cat._id]} />
        </section>
      ))}
    </div>
  )
}

export default CategoryServiceRails
