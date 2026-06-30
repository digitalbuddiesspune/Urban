import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios.js'
import ServiceCard from '../components/ServiceCard.jsx'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Pagination from '../components/ui/Pagination.jsx'

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState(1)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '',
    page: 1,
  })

  useEffect(() => {
    api.get('/user/categories').then((r) => setCategories(r.data.categories))
  }, [])

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
      const { data } = await api.get(`/user/services?${params.toString()}`)
      setServices(data.services)
      setPages(data.pages)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }))

  const onSearchSubmit = (e) => {
    e.preventDefault()
    setSearchParams(filters.search ? { search: filters.search } : {})
    fetchServices()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">All services</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit space-y-5 p-5">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </div>
          <form onSubmit={onSearchSubmit}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="flex-1 py-2 text-sm outline-none"
                placeholder="Service name"
              />
            </div>
          </form>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select className="input" value={filters.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Price range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="input"
                value={filters.minPrice}
                onChange={(e) => update('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="input"
                value={filters.maxPrice}
                onChange={(e) => update('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Minimum rating</label>
            <select className="input" value={filters.minRating} onChange={(e) => update('minRating', e.target.value)}>
              <option value="">Any</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sort by</label>
            <select className="input" value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>

        <div>
          {loading ? (
            <PageLoader />
          ) : services.length === 0 ? (
            <EmptyState title="No services found" subtitle="Try adjusting your filters or search." icon={Search} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((s) => (
                  <ServiceCard key={s._id} service={s} />
                ))}
              </div>
              <Pagination page={filters.page} pages={pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Services
