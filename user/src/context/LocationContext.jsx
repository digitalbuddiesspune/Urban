import { createContext, useContext, useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

const STORAGE_KEY = 'ue_user_location'

const LocationContext = createContext({
  location: null,
  status: 'idle',
  error: null,
  requestLocation: () => {},
  clearLocation: () => {},
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

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => loadStored())
  const [status, setStatus] = useState(() => (loadStored() ? 'ready' : 'idle'))
  const [error, setError] = useState(null)
  const [promptDismissed, setPromptDismissed] = useState(false)

  const persist = (loc) => {
    setLocation(loc)
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported on this device')
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
          updatedAt: Date.now(),
        }
        persist(loc)
        setStatus('ready')
        setPromptDismissed(true)
      },
      (err) => {
        setStatus('error')
        setError(err.message || 'Unable to get your location')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    )
  }

  const clearLocation = () => {
    persist(null)
    setStatus('idle')
    setError(null)
  }

  // Auto-request once on first visit if nothing stored
  useEffect(() => {
    if (!location && status === 'idle') {
      requestLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showBanner = !location && status !== 'loading' && !promptDismissed

  return (
    <LocationContext.Provider value={{ location, status, error, requestLocation, clearLocation }}>
      {children}
      {showBanner && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4">
          <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Share your location</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  We use it to show the nearest vendors for your service requests.
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
              <button type="button" onClick={requestLocation} className="btn-primary px-4 py-2 text-sm">
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)
