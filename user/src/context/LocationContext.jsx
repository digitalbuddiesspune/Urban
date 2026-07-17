import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext.jsx'

const STORAGE_KEY = 'ue_user_location'

const LocationContext = createContext({
  location: null,
  status: 'idle',
  error: null,
  requestLocation: () => {},
  clearLocation: () => {},
  setAddressLocation: () => {},
  setCityLocation: () => {},
})

const loadStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) return parsed
  } catch {
    /* ignore */
  }
  return null
}

const fromPrimaryAddress = (addresses) => {
  if (!Array.isArray(addresses)) return null
  const primary = addresses.find(
    (a) => a.isPrimary && Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng)),
  )
  if (!primary) return null
  return {
    lat: Number(primary.lat),
    lng: Number(primary.lng),
    source: 'address',
    addressId: primary._id,
    label: primary.label || 'Home',
    city: primary.city || undefined,
    updatedAt: Date.now(),
  }
}

export const LocationProvider = ({ children }) => {
  const { user } = useAuth()
  const [location, setLocation] = useState(() => loadStored())
  const [status, setStatus] = useState(() => (loadStored() ? 'ready' : 'idle'))
  const [error, setError] = useState(null)
  const [promptDismissed, setPromptDismissed] = useState(false)

  const persist = useCallback((loc) => {
    setLocation(loc)
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  /** Apply a saved primary address as the browsing location for nearest services */
  const setAddressLocation = useCallback(
    (address, { silent = false } = {}) => {
      if (!address || !Number.isFinite(Number(address.lat)) || !Number.isFinite(Number(address.lng))) {
        if (!silent) toast.error('This address has no pinned location')
        return false
      }
      persist({
        lat: Number(address.lat),
        lng: Number(address.lng),
        source: 'address',
        addressId: address._id,
        label: address.label || 'Home',
        city: address.city || undefined,
        updatedAt: Date.now(),
      })
      setStatus('ready')
      setError(null)
      setPromptDismissed(true)
      if (!silent) toast.success(`Showing services near ${address.label || 'your address'}`)
      return true
    },
    [persist],
  )

  /** Browse services in a supported city (centroid + city name filter). */
  const setCityLocation = useCallback(
    (city, { silent = false } = {}) => {
      if (!city || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lng))) {
        if (!silent) toast.error('Invalid city')
        return false
      }
      const name = city.name || city.id
      persist({
        lat: Number(city.lat),
        lng: Number(city.lng),
        source: 'city',
        city: name,
        cityId: city.id,
        label: name,
        updatedAt: Date.now(),
      })
      setStatus('ready')
      setError(null)
      setPromptDismissed(true)
      if (!silent) toast.success(`Showing services in ${name}`)
      return true
    },
    [persist],
  )

  /**
   * @param {{ forceFresh?: boolean, silent?: boolean }} [options]
   */
  const requestLocation = (options = {}) => {
    const { forceFresh = false, silent = false } = options
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported on this device')
      if (!silent) toast.error('Geolocation is not supported on this device')
      return
    }
    setStatus('loading')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'gps',
          updatedAt: Date.now(),
        }
        persist(loc)
        setStatus('ready')
        setPromptDismissed(true)
        if (!silent) toast.success('Location updated — showing nearest services')
      },
      (err) => {
        setStatus('error')
        const msg = err.message || 'Unable to get your location'
        setError(msg)
        if (!silent) toast.error(msg)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: forceFresh ? 0 : 5 * 60 * 1000,
      },
    )
  }

  const clearLocation = () => {
    persist(null)
    setStatus('idle')
    setError(null)
  }

  // When logged-in user has / changes primary address, use it for nearest services
  const primaryKey = user?.addresses
    ?.map((a) => `${a._id}:${a.isPrimary}:${a.lat}:${a.lng}`)
    .join('|')

  useEffect(() => {
    if (!user) return
    const primaryLoc = fromPrimaryAddress(user.addresses)
    if (!primaryLoc) return
    persist(primaryLoc)
    setStatus('ready')
    setPromptDismissed(true)
  }, [user, primaryKey, persist])

  // On logout, drop address-based location and fall back to GPS if needed
  useEffect(() => {
    if (user) return
    if (location?.source === 'address') {
      persist(null)
      setStatus('idle')
      requestLocation({ silent: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Auto-request GPS once on first visit if nothing stored and no primary address
  useEffect(() => {
    if (location || status !== 'idle') return
    if (fromPrimaryAddress(user?.addresses)) return
    requestLocation({ silent: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showBanner = !location && status !== 'loading' && !promptDismissed

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        error,
        requestLocation,
        clearLocation,
        setAddressLocation,
        setCityLocation,
      }}
    >
      {children}
      {showBanner && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4">
          <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Choose your city</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Pick a city like Mumbai or Pune from the menu, or share GPS for nearest vendors.
                </p>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setPromptDismissed(true)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => requestLocation({ forceFresh: true })}
                className="btn-primary px-4 py-2 text-sm"
              >
                Use GPS
              </button>
            </div>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
