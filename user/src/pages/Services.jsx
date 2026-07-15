import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../api/axios.js'
import CategoryCard from '../components/CategoryCard.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import { getCategoryImage } from '../utils/categoryImages.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'

const Services = () => {
  const { theme } = useTheme()
  const { location, status: locStatus, requestLocation } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [pages, setPages] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '',
    page: 1,
  })

  const browsingAll = !filters.category
  const hasVendorFilters = Boolean(filters.minPrice || filters.maxPrice || filters.minRating || filters.sort)

  useEffect(() => {
    api
      .get('/user/categories')
      .then((r) => setCategories(r.data.categories))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    setFilters((f) => ({ ...f, category, search, page: 1 }))
  }, [searchParams])

  const fetchVendorServices = useCallback(async () => {
    if (!filters.category) {
      setServices([])
      setPages(1)
      setServicesLoading(false)
      return
    }

    setServicesLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
      if (location?.lat != null && location?.lng != null) {
        params.set('lat', String(location.lat))
        params.set('lng', String(location.lng))
        if (!filters.sort) params.set('sort', 'nearest')
      }
      const { data } = await api.get(`/user/services?${params.toString()}`)
      setServices(data.services)
      setPages(data.pages)
    } finally {
      setServicesLoading(false)
    }
  }, [filters, location])

  useEffect(() => {
    if (browsingAll) return
    fetchVendorServices()
  }, [browsingAll, fetchVendorServices])

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [filtersOpen])

  const setCategory = (categoryId) => {
    const next = { ...filters, category: categoryId, page: 1 }
    setFilters(next)
    if (categoryId) {
      setSearchParams(categoryId ? { category: categoryId } : {})
    } else {
      setSearchParams(filters.search ? { search: filters.search } : {})
    }
  }

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }))

  const onSearchSubmit = (e) => {
    e.preventDefault()
    if (browsingAll) {
      setSearchParams(filters.search ? { search: filters.search } : {})
    } else {
      fetchVendorServices()
    }
    setFiltersOpen(false)
  }

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (c) => !filters.search || c.name.toLowerCase().includes(filters.search.toLowerCase()),
      ),
    [categories, filters.search],
  )

  const selectedCategory = categories.find((c) => c._id === filters.category)
  const pageTitle = browsingAll ? 'All services' : selectedCategory?.name || 'Service'
  const loading = browsingAll ? categoriesLoading : servicesLoading

  const filterFields = (
    <>
      <form onSubmit={onSearchSubmit}>
        <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="min-w-0 flex-1 py-2.5 text-base outline-none sm:py-2 sm:text-sm"
            placeholder="Search services"
          />
        </div>
      </form>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Services</label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
              browsingAll ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All services
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setCategory(c._id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                filters.category === c._id ? 'bg-black text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {!browsingAll && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Price range</label>
            <div className="grid grid-cols-2 gap-2">
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
              <option value="">Nearest first</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </>
      )}

      <button type="button" onClick={onSearchSubmit} className="btn-primary w-full py-2.5 lg:hidden">
        Apply
      </button>
    </>
  )

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.minRating, filters.sort].filter(
    Boolean,
  ).length

  return (
    <div className="py-6 sm:py-8">
      {theme.images.servicesBanner && (
        <div className="mb-6 overflow-hidden px-4 sm:px-6">
          <img src={theme.images.servicesBanner} alt="" className="h-40 w-full rounded-2xl object-cover sm:h-52" />
        </div>
      )}
      <div className="mb-5 flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{pageTitle}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {browsingAll ? 'Browse all home services we offer' : location ? 'Nearest providers for this service' : 'Available providers for this service'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Browse
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <SlidersHorizontal className="h-4 w-4" /> Browse services
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">{filterFields}</div>
          </div>
        </div>
      )}

      <div className="flex items-start">
        <aside className="sticky top-16 z-30 hidden max-h-[calc(100vh-4rem)] w-64 shrink-0 self-start overflow-y-auto border-y border-r border-slate-200 bg-white p-5 shadow-sm [scrollbar-width:none] sm:top-20 lg:block [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <SlidersHorizontal className="h-4 w-4" /> Browse services
          </div>
          <div className="mt-5 space-y-5">{filterFields}</div>
        </aside>

        <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
          <div className="mb-5 hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {browsingAll ? 'Browse all home services we offer' : location ? 'Nearest providers for this service' : 'Available providers for this service'}
            </p>
          </div>

          {loading ? (
            <PageLoader />
          ) : browsingAll ? (
            visibleCategories.length === 0 ? (
              <EmptyState title="No services found" subtitle="Try a different search term." icon={Search} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {visibleCategories.map((cat) => (
                  <CategoryCard key={cat._id} category={cat} />
                ))}
              </div>
            )
          ) : (
            <>
              {selectedCategory && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="relative h-40 sm:h-48">
                    <img
                      src={getCategoryImage(selectedCategory)}
                      alt={selectedCategory.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <h2 className="text-xl font-bold text-white sm:text-2xl">{selectedCategory.name}</h2>
                      {selectedCategory.description && (
                        <p className="mt-1 max-w-2xl text-sm text-white/85">{selectedCategory.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!location && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-900">
                    Enable location to see <strong>nearest vendors</strong> first.
                  </p>
                  <button type="button" onClick={requestLocation} className="btn-primary px-4 py-2 text-sm" disabled={locStatus === 'loading'}>
                    {locStatus === 'loading' ? 'Locating…' : 'Use my location'}
                  </button>
                </div>
              )}

              {location && services.length > 0 && services[0]?.distanceLabel && (
                <p className="mb-4 text-sm text-slate-500">
                  Sorted by distance — nearest first ({services[0].distanceLabel} away)
                </p>
              )}
              {services.length === 0 ? (
                <EmptyState
                  title="Providers coming soon"
                  subtitle="This service is available — verified providers will be listed here shortly."
                  icon={Search}
                />
              ) : (
                <>
                  {hasVendorFilters && (
                    <p className="mb-4 text-sm text-slate-500">Showing provider listings for {selectedCategory?.name}</p>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((s, idx) => (
                      <ServiceCard key={s._id} service={s} isNearest={idx === 0 && s.distanceKm != null} />
                    ))}
                  </div>
                  <Pagination page={filters.page} pages={pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Services
