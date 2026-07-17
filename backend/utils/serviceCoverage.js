import Settings from '../models/Settings.js'
import { haversineKm, parseLatLng } from './geo.js'
import { geocodePlace } from './geocode.js'

export const resolvePlaceCoordinates = async ({ lat, lng, pincode, city, state } = {}) => {
  const explicit = parseLatLng(lat, lng)
  if (explicit) return explicit
  return geocodePlace({ pincode, city, state })
}

export const resolveVendorCoordinates = async (vendor) => {
  if (!vendor) return null
  const coordinates = vendor.location?.coordinates
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    return parseLatLng(coordinates[1], coordinates[0])
  }
  return geocodePlace({
    pincode: vendor.pincode,
    city: vendor.city,
  })
}

export const getServiceRadiusKm = async () => {
  const settings = await Settings.getSingleton()
  return Number(settings.serviceRadiusKm) || 20
}

export const checkServiceCoverage = async ({ vendor, location, radiusKm }) => {
  if (!location) {
    return { available: false, distanceKm: null, reason: 'Location is required' }
  }

  const vendorLocation = await resolveVendorCoordinates(vendor)
  if (!vendorLocation) {
    return {
      available: false,
      distanceKm: null,
      reason: 'Provider location is not configured',
    }
  }

  const radius = radiusKm ?? (await getServiceRadiusKm())
  const distanceKm = haversineKm(
    location.lat,
    location.lng,
    vendorLocation.lat,
    vendorLocation.lng,
  )

  return {
    available: distanceKm <= radius,
    distanceKm,
    radiusKm: radius,
    reason: distanceKm <= radius ? null : `Provider is outside the ${radius} km service radius`,
  }
}
