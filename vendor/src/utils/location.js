/** Shared helpers for picking vendor geo location */

export const detectBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        })
      },
      (err) => reject(new Error(err.message || 'Could not detect location')),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  })

export const coordsFromVendor = (vendor) => {
  const coords = vendor?.location?.coordinates
  if (!Array.isArray(coords) || coords.length < 2) return { lat: '', lng: '' }
  return { lat: String(coords[1]), lng: String(coords[0]) }
}
