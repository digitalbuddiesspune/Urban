import asyncHandler from '../utils/asyncHandler.js'
import Category from '../models/Category.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
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

// @desc Get single service details (includes distance when lat/lng query provided)
// @route GET /api/user/services/:id
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('vendorId', 'name businessName rating serviceAreas city address location')
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }

  const userLoc = parseLatLng(req.query.lat, req.query.lng)
  let distanceKm = null
  const coords = service.vendorId?.location?.coordinates
  if (userLoc && Array.isArray(coords) && coords.length === 2) {
    distanceKm = haversineKm(userLoc.lat, userLoc.lng, coords[1], coords[0])
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
