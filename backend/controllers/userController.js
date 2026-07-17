import asyncHandler from '../utils/asyncHandler.js'
import Category from '../models/Category.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Cart from '../models/Cart.js'
import Review from '../models/Review.js'
import Vendor from '../models/Vendor.js'
import User from '../models/User.js'
import Settings from '../models/Settings.js'
import { defaultUserSiteTheme, mergeUserSiteTheme } from '../utils/defaultUserSiteTheme.js'
import { haversineKm, parseLatLng, formatDistanceKm } from '../utils/geo.js'
import { getSupportedCities, normalizeCity } from '../utils/geocode.js'
import {
  checkServiceCoverage,
  getServiceRadiusKm,
  resolvePlaceCoordinates,
  resolveVendorCoordinates,
} from '../utils/serviceCoverage.js'

/** True when the vendor/service explicitly lists this city. */
const servesCity = (service, cityKey) => {
  if (!cityKey) return false
  const vendor = service.vendorId
  const vendorCity = normalizeCity(vendor?.city)
  const areas = [
    ...(vendor?.serviceAreas || []),
    ...(service.serviceArea || []),
  ].map(normalizeCity)
  return vendorCity === cityKey || areas.includes(cityKey)
}

/** Build a Map of vendorId -> { lat, lng } for a list of services, geocoding once per vendor. */
const resolveVendorCoordsMap = async (services) => {
  const map = new Map()
  const uniqueVendors = new Map()
  for (const s of services) {
    if (s.vendorId?._id) uniqueVendors.set(String(s.vendorId._id), s.vendorId)
  }
  await Promise.all(
    [...uniqueVendors.entries()].map(async ([id, vendor]) => {
      map.set(id, await resolveVendorCoordinates(vendor))
    }),
  )
  return map
}

// @desc Get user-site theme & branding (public)
// @route GET /api/user/site-theme
export const getSiteTheme = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton()
  res.json({
    success: true,
    siteName: settings.siteName,
    theme: mergeUserSiteTheme(defaultUserSiteTheme, settings.userSiteTheme),
  })
})

// @desc Get categories visible to customers (active, or not explicitly disabled)
// @route GET /api/user/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: { $ne: false } }).sort('name')
  res.json({ success: true, categories })
})

// @desc List cities customers can browse services in
// @route GET /api/user/cities
export const getCities = asyncHandler(async (_req, res) => {
  res.json({ success: true, cities: getSupportedCities() })
})

// @desc Browse / search / filter services (sorted by nearest vendor when lat/lng provided)
// @route GET /api/user/services
export const getServices = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = 1,
    limit = 12,
    lat,
    lng,
    pincode,
    city,
    maxDistanceKm,
  } = req.query

  const query = { status: 'approved', isActive: true, availability: true }
  if (category) query.categoryId = category
  if (search) query.title = new RegExp(search, 'i')
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }
  if (minRating) query.rating = { $gte: Number(minRating) }

  // Resolve the user location: explicit lat/lng, else geocode pincode/city.
  let userLoc = parseLatLng(lat, lng)
  if (!userLoc && (pincode || city)) {
    userLoc = await resolvePlaceCoordinates({ pincode, city })
  }
  const sortByNearest = Boolean(userLoc) && (!sort || sort === 'nearest')

  let sortBy = '-createdAt'
  if (sort === 'newest') sortBy = '-createdAt'
  if (sort === 'price_asc') sortBy = 'price'
  if (sort === 'price_desc') sortBy = '-price'
  if (sort === 'rating') sortBy = '-rating'

  const pageNum = Number(page) || 1
  const limitNum = Number(limit) || 12

  // When sorting by distance we load matches then paginate in memory
  const rawServices = await Service.find(query)
    .populate('categoryId', 'name')
    .populate('vendorId', 'name businessName rating city pincode address location status serviceAreas')
    .sort(sortByNearest ? '-createdAt' : sortBy)

  const visible = rawServices.filter((s) => s.vendorId && s.vendorId.status !== 'blocked')
  const cityKey = city ? normalizeCity(city) : null

  // Resolve coordinates for each vendor once (stored GeoJSON, else geocode city/pincode).
  const vendorCoords = userLoc ? await resolveVendorCoordsMap(visible) : new Map()

  let services = visible.map((s) => {
    const obj = s.toObject()
    let distanceKm = null
    if (userLoc) {
      const coords = vendorCoords.get(String(s.vendorId._id))
      if (coords) {
        distanceKm = haversineKm(userLoc.lat, userLoc.lng, coords.lat, coords.lng)
      }
    }
    return {
      ...obj,
      distanceKm,
      distanceLabel: formatDistanceKm(distanceKm),
    }
  })

  // Apply admin-managed service radius when the user has a location.
  // City browse also keeps vendors that explicitly serve that city.
  let serviceRadiusKm = null
  if (userLoc) {
    const adminRadius = await getServiceRadiusKm()
    const queryRadius = Number(maxDistanceKm)
    // Query may only tighten the radius, never expand beyond admin setting
    serviceRadiusKm =
      Number.isFinite(queryRadius) && queryRadius > 0
        ? Math.min(adminRadius, queryRadius)
        : adminRadius

    services = services.filter((s) => {
      const inRadius = s.distanceKm != null && s.distanceKm <= serviceRadiusKm
      if (cityKey) return inRadius || servesCity(s, cityKey)
      return inRadius
    })
  } else if (cityKey) {
    services = services.filter((s) => servesCity(s, cityKey))
  }

  if (sortByNearest) {
    services.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }

  const total = services.length
  const skip = (pageNum - 1) * limitNum
  const paged = services.slice(skip, skip + limitNum)

  res.json({
    success: true,
    services: paged,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    sortedBy: sortByNearest ? 'nearest' : sort || 'newest',
    userLocation: userLoc,
    serviceRadiusKm,
  })
})

// @desc Get single service details (includes distance when lat/lng query provided).
//       When the same service is offered by multiple vendors, the nearest
//       vendor's offering is returned.
// @route GET /api/user/services/:id
export const getServiceById = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate(
      'vendorId',
      'name businessName rating serviceAreas city pincode address location status',
    )
  if (
    !service ||
    service.status !== 'approved' ||
    !service.isActive ||
    !service.availability ||
    !service.vendorId ||
    service.vendorId.status === 'blocked'
  ) {
    res.status(404)
    throw new Error('Service not found')
  }

  let userLoc = parseLatLng(req.query.lat, req.query.lng)
  if (!userLoc && (req.query.pincode || req.query.city)) {
    userLoc = await resolvePlaceCoordinates({
      pincode: req.query.pincode,
      city: req.query.city,
    })
  }

  const distanceFor = async (svc) => {
    if (!userLoc) return null
    const coords = await resolveVendorCoordinates(svc.vendorId)
    if (!coords) return null
    return haversineKm(userLoc.lat, userLoc.lng, coords.lat, coords.lng)
  }

  let distanceKm = await distanceFor(service)
  const cityKey = req.query.city ? normalizeCity(req.query.city) : null

  // If other vendors offer the same service, switch to the nearest one within radius
  // (or one that explicitly serves the selected city).
  let serviceRadiusKm = null
  if (userLoc) {
    serviceRadiusKm = await getServiceRadiusKm()

    const variants = await Service.find({
      _id: { $ne: service._id },
      title: service.title,
      categoryId: service.categoryId?._id || service.categoryId,
      status: 'approved',
      isActive: true,
      availability: true,
    })
      .populate('categoryId', 'name')
      .populate('vendorId', 'name businessName rating serviceAreas city pincode address location status')

    const isReachable = (svc, d) => {
      if (d != null && d <= serviceRadiusKm) return true
      return cityKey ? servesCity(svc, cityKey) : false
    }

    for (const variant of variants) {
      if (!variant.vendorId || variant.vendorId.status === 'blocked') continue
      const d = await distanceFor(variant)
      if (!isReachable(variant, d)) continue
      // City browse keeps the exact vendor the user clicked; only replace an
      // unreachable service. GPS/address browse still prefers the nearest vendor.
      const shouldReplace = cityKey
        ? !isReachable(service, distanceKm)
        : !isReachable(service, distanceKm) || (d != null && (distanceKm == null || d < distanceKm))
      if (shouldReplace) {
        service = variant
        distanceKm = d
      }
    }

    if (!isReachable(service, distanceKm)) {
      res.status(404)
      throw new Error(
        cityKey
          ? 'No provider is available for this service in the selected city'
          : `No provider is available within ${serviceRadiusKm} km of this location`,
      )
    }
  }

  const reviews = await Review.find({ serviceId: service._id })
    .populate('userId', 'name')
    .sort('-createdAt')

  const withinRadius = userLoc
    ? (distanceKm != null && distanceKm <= (serviceRadiusKm || 20)) || servesCity(service, cityKey)
    : null

  res.json({
    success: true,
    service: {
      ...service.toObject(),
      distanceKm,
      distanceLabel: formatDistanceKm(distanceKm),
      withinRadius,
    },
    serviceRadiusKm,
    reviews,
  })
})

// @desc Create a booking
// @route POST /api/user/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, bookingTime, address, paymentMethod, userNote } = req.body

  const service = await Service.findById(serviceId).populate(
    'vendorId',
    'status city pincode location',
  )
  if (
    !service ||
    service.status !== 'approved' ||
    !service.isActive ||
    !service.availability ||
    !service.vendorId ||
    service.vendorId.status === 'blocked'
  ) {
    res.status(404)
    throw new Error('Service not available')
  }
  if (!bookingDate || !bookingTime || !address) {
    res.status(400)
    throw new Error('Booking date, time and address are required')
  }

  // Booking eligibility is always checked against the actual service address,
  // not just the browsing/primary location.
  const bookingLocation = await resolvePlaceCoordinates(address)
  if (!bookingLocation) {
    res.status(400)
    throw new Error('Could not locate the service address. Check its city and pincode.')
  }
  const coverage = await checkServiceCoverage({
    vendor: service.vendorId,
    location: bookingLocation,
  })
  if (!coverage.available) {
    res.status(400)
    throw new Error(
      coverage.distanceKm == null
        ? 'This provider has no service location configured'
        : `This service is not available at this address (provider is ${formatDistanceKm(coverage.distanceKm)} away; maximum ${coverage.radiusKm} km)`,
    )
  }

  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const booking = await Booking.create({
    userId: req.user._id,
    vendorId: service.vendorId._id,
    serviceId: service._id,
    categoryId: service.categoryId,
    bookingDate,
    bookingTime,
    address,
    price,
    paymentMethod: paymentMethod || 'cash',
    userNote: userNote || '',
  })

  res.status(201).json({ success: true, booking })
})

// @desc Get user's bookings
// @route GET /api/user/bookings
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('serviceId', 'title images')
    .populate('vendorId', 'name businessName phone')
    .sort('-createdAt')
  res.json({ success: true, bookings })
})

// @desc Cancel booking
// @route PUT /api/user/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id })
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  if (['completed', 'cancelled'].includes(booking.bookingStatus)) {
    res.status(400)
    throw new Error(`Cannot cancel a ${booking.bookingStatus} booking`)
  }
  booking.bookingStatus = 'cancelled'
  await booking.save()
  res.json({ success: true, booking })
})

// @desc Add a review after completion
// @route POST /api/user/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body

  const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id })
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  if (booking.bookingStatus !== 'completed') {
    res.status(400)
    throw new Error('You can only review completed bookings')
  }
  if (booking.isReviewed) {
    res.status(400)
    throw new Error('You have already reviewed this booking')
  }

  const review = await Review.create({
    userId: req.user._id,
    vendorId: booking.vendorId,
    serviceId: booking.serviceId,
    bookingId: booking._id,
    rating,
    comment,
  })

  booking.isReviewed = true
  await booking.save()

  // Recalculate service rating
  const serviceReviews = await Review.find({ serviceId: booking.serviceId })
  const avg = serviceReviews.reduce((s, r) => s + r.rating, 0) / serviceReviews.length
  await Service.findByIdAndUpdate(booking.serviceId, {
    rating: avg.toFixed(1),
    numReviews: serviceReviews.length,
  })

  // Recalculate vendor rating
  const vendorReviews = await Review.find({ vendorId: booking.vendorId })
  const vAvg = vendorReviews.reduce((s, r) => s + r.rating, 0) / vendorReviews.length
  await Vendor.findByIdAndUpdate(booking.vendorId, { rating: vAvg.toFixed(1) })

  res.status(201).json({ success: true, review })
})

// ---------- Addresses ----------

const unsetPrimary = (user) => {
  user.addresses.forEach((a) => {
    a.isPrimary = false
  })
}

/**
 * Resolve coordinates for an address.
 * Priority: explicit GPS pin (lat/lng) → geocode from pincode/city.
 */
const resolveAddressCoords = async ({ lat, lng, pincode, city, state }) => {
  return resolvePlaceCoordinates({ lat, lng, pincode, city, state })
}

// @desc Get saved addresses
// @route GET /api/user/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({ success: true, addresses: user.addresses })
})

// @desc Add address
// @route POST /api/user/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const { label, line1, line2, city, state, pincode, lat, lng, isPrimary } = req.body

  if (!line1 || !city || !pincode) {
    res.status(400)
    throw new Error('Address line, city and pincode are required')
  }

  const coords = await resolveAddressCoords({ lat, lng, pincode, city, state })
  const makePrimary = Boolean(isPrimary) || user.addresses.length === 0

  if (makePrimary && !coords) {
    res.status(400)
    throw new Error(
      'Could not locate this address. Please check the city / pincode (or pin your exact location).',
    )
  }

  if (makePrimary) unsetPrimary(user)

  user.addresses.push({
    label: label || 'Home',
    line1,
    line2: line2 || '',
    city,
    state: state || '',
    pincode,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    isPrimary: makePrimary,
  })

  await user.save()
  res.status(201).json({ success: true, addresses: user.addresses })
})

// @desc Set primary address (used for nearest services)
// @route PUT /api/user/addresses/:addressId/primary
export const setPrimaryAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const address = user.addresses.id(req.params.addressId)
  if (!address) {
    res.status(404)
    throw new Error('Address not found')
  }

  // Explicit GPS pin overrides; otherwise derive from the address pincode/city.
  const coords = await resolveAddressCoords({
    lat: req.body.lat,
    lng: req.body.lng,
    pincode: address.pincode,
    city: address.city,
    state: address.state,
  })

  if (!coords) {
    res.status(400)
    throw new Error(
      'Could not locate this address. Please check the city / pincode (or pin your exact location).',
    )
  }

  address.lat = coords.lat
  address.lng = coords.lng

  unsetPrimary(user)
  address.isPrimary = true
  await user.save()

  res.json({ success: true, addresses: user.addresses, primary: address })
})

// @desc Delete address
// @route DELETE /api/user/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const removing = user.addresses.id(req.params.addressId)
  const wasPrimary = removing?.isPrimary

  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId)

  if (wasPrimary && user.addresses.length > 0) {
    const next =
      user.addresses.find((a) => Number.isFinite(a.lat) && Number.isFinite(a.lng)) || user.addresses[0]
    if (Number.isFinite(next.lat) && Number.isFinite(next.lng)) {
      next.isPrimary = true
    }
  }

  await user.save()
  res.json({ success: true, addresses: user.addresses })
})

// ---------- Cart ----------

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId })
  if (!cart) {
    cart = await Cart.create({ userId, items: [] })
  }
  return cart
}

const getPrimaryLocation = async (user) => {
  const primary = user?.addresses?.find((a) => a.isPrimary)
  return primary ? resolvePlaceCoordinates(primary) : null
}

const getCartLocation = async (req) => {
  const supplied = await resolvePlaceCoordinates({
    lat: req.query?.lat ?? req.body?.lat,
    lng: req.query?.lng ?? req.body?.lng,
  })
  return supplied || getPrimaryLocation(req.user)
}

const formatCartItems = async (cart, location) => {
  const radiusKm = location ? await getServiceRadiusKm() : null
  return Promise.all(
    (cart?.items || []).map(async (item) => {
      const service = item.serviceId
      if (!service || typeof service !== 'object' || !service._id) return null
      const baseAvailable =
        service.status === 'approved' &&
        service.isActive !== false &&
        service.availability !== false &&
        service.vendorId &&
        service.vendorId.status !== 'blocked'
      const coverage =
        baseAvailable && location
          ? await checkServiceCoverage({
              vendor: service.vendorId,
              location,
              radiusKm,
            })
          : null
      const available = baseAvailable && (!location || coverage?.available)
      const price = service.discountPrice > 0 ? service.discountPrice : service.price
      return {
        serviceId: service._id,
        title: service.title,
        image: service.images?.[0] || '',
        price,
        originalPrice: service.price,
        discountPrice: service.discountPrice || 0,
        qty: item.qty || 1,
        categoryName: service.categoryId?.name || '',
        bookingDate: item.bookingDate || '',
        bookingTime: item.bookingTime || '',
        available,
        unavailableReason: available
          ? ''
          : coverage?.reason || 'Service is no longer available',
        distanceKm: coverage?.distanceKm ?? null,
        distanceLabel: formatDistanceKm(coverage?.distanceKm),
      }
    }),
  ).then((items) => items.filter(Boolean))
}

const populateCart = (cartId) =>
  Cart.findById(cartId).populate({
    path: 'items.serviceId',
    select:
      'title images price discountPrice status isActive availability categoryId vendorId',
    populate: [
      { path: 'categoryId', select: 'name' },
      { path: 'vendorId', select: 'status city pincode location' },
    ],
  })

// @desc Get current user's cart (prices from live services)
// @route GET /api/user/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  const populated = await populateCart(cart._id)
  const location = await getCartLocation(req)
  res.json({ success: true, items: await formatCartItems(populated, location) })
})

// @desc Add / update service in cart
// @route POST /api/user/cart/items
export const addCartItem = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, bookingTime, qty } = req.body
  if (!serviceId) {
    res.status(400)
    throw new Error('Service is required')
  }
  if (!bookingDate || !bookingTime) {
    res.status(400)
    throw new Error('Booking date and time are required')
  }

  const service = await Service.findById(serviceId).populate(
    'vendorId',
    'status city pincode location',
  )
  if (
    !service ||
    service.status !== 'approved' ||
    !service.isActive ||
    !service.availability ||
    !service.vendorId ||
    service.vendorId.status === 'blocked'
  ) {
    res.status(404)
    throw new Error('Service not available')
  }

  const location = await getCartLocation(req)
  if (!location) {
    res.status(400)
    throw new Error('Set a primary address or enable location before adding a service')
  }
  const coverage = await checkServiceCoverage({ vendor: service.vendorId, location })
  if (!coverage.available) {
    res.status(400)
    throw new Error(coverage.reason || 'Service is not available at your location')
  }

  const cart = await getOrCreateCart(req.user._id)
  const existing = cart.items.find((i) => String(i.serviceId) === String(serviceId))
  const alreadyInCart = Boolean(existing)

  if (existing) {
    existing.bookingDate = bookingDate
    existing.bookingTime = bookingTime
    if (qty != null) existing.qty = Math.max(1, Number(qty) || 1)
  } else {
    cart.items.push({
      serviceId,
      bookingDate,
      bookingTime,
      qty: Math.max(1, Number(qty) || 1),
    })
  }

  await cart.save()
  const populated = await populateCart(cart._id)
  res.status(alreadyInCart ? 200 : 201).json({
    success: true,
    alreadyInCart,
    items: await formatCartItems(populated, location),
  })
})

// @desc Update cart item schedule / qty
// @route PUT /api/user/cart/items/:serviceId
export const updateCartItem = asyncHandler(async (req, res) => {
  const { bookingDate, bookingTime, qty } = req.body
  const cart = await getOrCreateCart(req.user._id)
  const item = cart.items.find((i) => String(i.serviceId) === String(req.params.serviceId))
  if (!item) {
    res.status(404)
    throw new Error('Item not found in cart')
  }

  if (bookingDate != null) item.bookingDate = bookingDate
  if (bookingTime != null) item.bookingTime = bookingTime
  if (qty != null) {
    const next = Number(qty)
    if (!Number.isFinite(next) || next < 1) {
      cart.items = cart.items.filter((i) => String(i.serviceId) !== String(req.params.serviceId))
    } else {
      item.qty = next
    }
  }

  await cart.save()
  const populated = await populateCart(cart._id)
  const location = await getCartLocation(req)
  res.json({ success: true, items: await formatCartItems(populated, location) })
})

// @desc Remove one item from cart
// @route DELETE /api/user/cart/items/:serviceId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = cart.items.filter((i) => String(i.serviceId) !== String(req.params.serviceId))
  await cart.save()
  const populated = await populateCart(cart._id)
  const location = await getCartLocation(req)
  res.json({ success: true, items: await formatCartItems(populated, location) })
})

// @desc Clear cart
// @route DELETE /api/user/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, items: [] })
})
