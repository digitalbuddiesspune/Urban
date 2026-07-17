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

// @desc Browse / search / filter services (sorted by nearest vendor when lat/lng provided)
// @route GET /api/user/services
export const getServices = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, minRating, sort, page = 1, limit = 12, lat, lng, maxDistanceKm } =
    req.query

  const query = { status: 'approved', isActive: true, availability: true }
  if (category) query.categoryId = category
  if (search) query.title = new RegExp(search, 'i')
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }
  if (minRating) query.rating = { $gte: Number(minRating) }

  const userLoc = parseLatLng(lat, lng)
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
    .populate('vendorId', 'name businessName rating city address location status')
    .sort(sortByNearest ? '-createdAt' : sortBy)

  let services = rawServices
    .filter((s) => s.vendorId && s.vendorId.status !== 'blocked')
    .map((s) => {
      const obj = s.toObject()
      let distanceKm = null
      const coords = s.vendorId?.location?.coordinates
      if (userLoc && Array.isArray(coords) && coords.length === 2) {
        distanceKm = haversineKm(userLoc.lat, userLoc.lng, coords[1], coords[0])
      }
      return {
        ...obj,
        distanceKm,
        distanceLabel: formatDistanceKm(distanceKm),
      }
    })

  if (userLoc && maxDistanceKm) {
    const maxKm = Number(maxDistanceKm)
    if (Number.isFinite(maxKm) && maxKm > 0) {
      services = services.filter((s) => s.distanceKm == null || s.distanceKm <= maxKm)
    }
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
  })
})

// @desc Get single service details (includes distance when lat/lng query provided).
//       When the same service is offered by multiple vendors, the nearest
//       vendor's offering is returned.
// @route GET /api/user/services/:id
export const getServiceById = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('vendorId', 'name businessName rating serviceAreas city address location status')
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }

  const userLoc = parseLatLng(req.query.lat, req.query.lng)

  const distanceFor = (svc) => {
    const coords = svc.vendorId?.location?.coordinates
    if (userLoc && Array.isArray(coords) && coords.length === 2) {
      return haversineKm(userLoc.lat, userLoc.lng, coords[1], coords[0])
    }
    return null
  }

  let distanceKm = distanceFor(service)

  // If other vendors offer the same service, switch to the nearest one.
  if (userLoc) {
    const variants = await Service.find({
      _id: { $ne: service._id },
      title: service.title,
      categoryId: service.categoryId?._id || service.categoryId,
      status: 'approved',
      isActive: true,
      availability: true,
    })
      .populate('categoryId', 'name')
      .populate('vendorId', 'name businessName rating serviceAreas city address location status')

    for (const variant of variants) {
      if (!variant.vendorId || variant.vendorId.status === 'blocked') continue
      const d = distanceFor(variant)
      if (d != null && (distanceKm == null || d < distanceKm)) {
        service = variant
        distanceKm = d
      }
    }
  }

  const reviews = await Review.find({ serviceId: service._id })
    .populate('userId', 'name')
    .sort('-createdAt')

  res.json({
    success: true,
    service: {
      ...service.toObject(),
      distanceKm,
      distanceLabel: formatDistanceKm(distanceKm),
    },
    reviews,
  })
})

// @desc Create a booking
// @route POST /api/user/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, bookingTime, address, paymentMethod, userNote } = req.body

  const service = await Service.findById(serviceId)
  if (!service || service.status !== 'approved') {
    res.status(404)
    throw new Error('Service not available')
  }
  if (!bookingDate || !bookingTime || !address) {
    res.status(400)
    throw new Error('Booking date, time and address are required')
  }

  const price = service.discountPrice > 0 ? service.discountPrice : service.price

  const booking = await Booking.create({
    userId: req.user._id,
    vendorId: service.vendorId,
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
  user.addresses.push(req.body)
  await user.save()
  res.status(201).json({ success: true, addresses: user.addresses })
})

// @desc Delete address
// @route DELETE /api/user/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId)
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

const formatCartItems = (cart) =>
  (cart?.items || [])
    .map((item) => {
      const service = item.serviceId
      if (!service || typeof service !== 'object' || !service._id) return null
      if (service.status && service.status !== 'approved') return null
      if (service.isActive === false) return null
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
      }
    })
    .filter(Boolean)

const populateCart = (cartId) =>
  Cart.findById(cartId).populate({
    path: 'items.serviceId',
    select: 'title images price discountPrice status isActive categoryId',
    populate: { path: 'categoryId', select: 'name' },
  })

// @desc Get current user's cart (prices from live services)
// @route GET /api/user/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  const populated = await populateCart(cart._id)
  res.json({ success: true, items: formatCartItems(populated) })
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

  const service = await Service.findById(serviceId)
  if (!service || service.status !== 'approved' || !service.isActive) {
    res.status(404)
    throw new Error('Service not available')
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
    items: formatCartItems(populated),
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
  res.json({ success: true, items: formatCartItems(populated) })
})

// @desc Remove one item from cart
// @route DELETE /api/user/cart/items/:serviceId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = cart.items.filter((i) => String(i.serviceId) !== String(req.params.serviceId))
  await cart.save()
  const populated = await populateCart(cart._id)
  res.json({ success: true, items: formatCartItems(populated) })
})

// @desc Clear cart
// @route DELETE /api/user/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, items: [] })
})
