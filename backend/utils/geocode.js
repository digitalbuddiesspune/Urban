/**
 * Lightweight geocoding: resolve a place (pincode / city) to { lat, lng }.
 *
 * Strategy:
 *  1. OpenStreetMap lookup for a precise pincode when available.
 *  2. Offline lookup for common Indian cities as a reliable fallback.
 * Results are cached in-memory per unique key for the process lifetime.
 */

// Approximate centroids for common Indian cities so nearest-sorting works offline.
// `name` is the customer-facing label; aliases share coordinates.
const CITY_COORDS = {
  mumbai: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  navimumbai: { name: 'Navi Mumbai', lat: 19.033, lng: 73.0297 },
  thane: { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  pune: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  delhi: { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  newdelhi: { name: 'New Delhi', lat: 28.6139, lng: 77.209, aliasOf: 'delhi' },
  noida: { name: 'Noida', lat: 28.5355, lng: 77.391 },
  gurugram: { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  gurgaon: { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, aliasOf: 'gurugram' },
  bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  bangalore: { name: 'Bangalore', lat: 12.9716, lng: 77.5946, aliasOf: 'bengaluru' },
  hyderabad: { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  kolkata: { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  ahmedabad: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  surat: { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  jaipur: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  lucknow: { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  kanpur: { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  nagpur: { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  indore: { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  bhopal: { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  patna: { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  chandigarh: { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  kochi: { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  visakhapatnam: { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  vadodara: { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  nashik: { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
}

const cache = new Map()

export const normalizeCity = (city = '') => city.toLowerCase().replace(/[^a-z]/g, '')

/** Public list of selectable cities (aliases omitted). */
export const getSupportedCities = () =>
  Object.entries(CITY_COORDS)
    .filter(([, v]) => !v.aliasOf)
    .map(([id, v]) => ({ id, name: v.name, lat: v.lat, lng: v.lng }))
    .sort((a, b) => a.name.localeCompare(b.name))

const cityLookup = (city) => {
  const key = normalizeCity(city)
  const hit = key && CITY_COORDS[key] ? CITY_COORDS[key] : null
  return hit ? { lat: hit.lat, lng: hit.lng } : null
}

const nominatim = async ({ pincode, city, state, country = 'India' }) => {
  if (typeof fetch !== 'function') return null
  try {
    const params = new URLSearchParams({ format: 'json', limit: '1', country })
    if (pincode) params.set('postalcode', String(pincode))
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'UrbanEase/1.0 (nearest-services)' },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    const hit = Array.isArray(data) ? data[0] : null
    if (!hit) return null
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng }
  } catch {
    return null
  }
}

/**
 * Resolve { pincode, city, state } to coordinates.
 * Pincode is preferred because a city centroid is too imprecise for a small
 * service radius. Known-city coordinates are only a fallback.
 */
export const geocodePlace = async ({ pincode, city, state } = {}) => {
  if (!pincode && !city) return null

  const key = `${pincode || ''}|${normalizeCity(city)}|${(state || '').toLowerCase()}`
  if (cache.has(key)) return cache.get(key)

  // A pincode is more precise than a city centroid.
  let coords = pincode ? await nominatim({ pincode }) : null

  // Fall back to a known city when the network lookup is unavailable.
  if (!coords) coords = cityLookup(city)

  // Last chance for cities not present in the offline map.
  if (!coords && city) coords = await nominatim({ city, state })

  cache.set(key, coords)
  return coords
}
