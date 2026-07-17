import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MapPin, Navigation } from 'lucide-react'
import api from '../api/axios.js'
import { useLocation } from '../context/LocationContext.jsx'

const locationLabel = (geo, geoStatus) => {
  if (geoStatus === 'loading') return 'Locating…'
  if (geo?.source === 'city') return geo.label || geo.city || 'City'
  if (geo?.source === 'address') return geo.label || 'Primary'
  if (geo) return 'Near me'
  return 'Select city'
}

/**
 * City / GPS location picker for the navbar.
 * @param {{ variant?: 'desktop' | 'mobile', isDarkNav?: boolean, onPicked?: () => void }} props
 */
const CityPicker = ({ variant = 'desktop', isDarkNav = false, onPicked }) => {
  const { location: geo, status: geoStatus, requestLocation, setCityLocation } = useLocation()
  const [open, setOpen] = useState(false)
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const rootRef = useRef(null)

  useEffect(() => {
    api
      .get('/user/cities')
      .then((r) => setCities(r.data.cities || []))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false))
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pickCity = (city) => {
    setCityLocation(city)
    setOpen(false)
    onPicked?.()
  }

  const useGps = () => {
    requestLocation({ forceFresh: true })
    setOpen(false)
    onPicked?.()
  }

  const triggerClass =
    variant === 'desktop'
      ? `flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
          isDarkNav ? 'text-white/90 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-50'
        }`
      : `flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
          isDarkNav ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-black/5'
        }`

  const panelClass =
    variant === 'desktop'
      ? 'absolute right-0 top-full z-[70] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'
      : 'mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white'

  return (
    <div ref={rootRef} className={`relative ${variant === 'mobile' ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Choose city or use GPS"
        className={triggerClass}
      >
        <MapPin className={`h-4 w-4 shrink-0 ${geo ? 'text-green-600' : ''}`} />
        <span className={variant === 'desktop' ? 'hidden max-w-[8rem] truncate lg:inline' : 'flex-1 truncate'}>
          {locationLabel(geo, geoStatus)}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 opacity-60 ${open ? 'rotate-180' : ''} transition`} />
      </button>

      {open && (
        <div className={panelClass} role="listbox" aria-label="Select city">
          <div className="border-b border-slate-100 p-2">
            <button
              type="button"
              onClick={useGps}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Navigation className="h-4 w-4 text-violet-600" />
              Use current location
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {loadingCities && (
              <li className="px-4 py-3 text-sm text-slate-400">Loading cities…</li>
            )}
            {!loadingCities && !cities.length && (
              <li className="px-4 py-3 text-sm text-slate-400">No cities available</li>
            )}
            {cities.map((city) => {
              const active =
                geo?.source === 'city' &&
                (geo.cityId === city.id || geo.city?.toLowerCase() === city.name.toLowerCase())
              return (
                <li key={city.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pickCity(city)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                      active ? 'font-semibold text-violet-700' : 'text-slate-700'
                    }`}
                  >
                    {city.name}
                    {active && <span className="text-xs text-violet-500">Selected</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CityPicker
