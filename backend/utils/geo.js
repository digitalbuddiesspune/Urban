/** Earth radius in km */
const R = 6371

const toRad = (deg) => (deg * Math.PI) / 180

/** Haversine distance in kilometers between two WGS84 points */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const formatDistanceKm = (km) => {
  if (km == null || Number.isNaN(km)) return null
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(km < 10 ? 1 : 0)} km`
}

/** Build GeoJSON Point from lat/lng (Mongo expects [lng, lat]) */
export const toGeoPoint = (lat, lng) => {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  }
}

export const parseLatLng = (lat, lng) => {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return { lat: latitude, lng: longitude }
}
