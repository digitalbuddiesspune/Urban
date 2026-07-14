import asyncHandler from '../utils/asyncHandler.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Vendor from '../models/Vendor.js'
import { buildVendorAlerts } from '../utils/dashboardAlerts.js'

// @desc Vendor dashboard
// @route GET /api/vendor/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id
  const [totalServices, approvedServices, totalBookings, pendingBookings, completedBookings] =
    await Promise.all([
      Service.countDocuments({ vendorId }),
      Service.countDocuments({ vendorId, status: 'approved' }),
      Booking.countDocuments({ vendorId }),
      Booking.countDocuments({ vendorId, bookingStatus: 'pending' }),
      Booking.countDocuments({ vendorId, bookingStatus: 'completed' }),
    ])

  const earningsAgg = await Booking.aggregate([
    { $match: { vendorId: vendorId, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ])

  const recentBookings = await Booking.find({ vendorId })
    .populate('userId', 'name')
    .populate('serviceId', 'title')
    .sort('-createdAt')
    .limit(5)

  const alerts = await buildVendorAlerts(vendorId)

  res.json({
    success: true,
    stats: {
      totalServices,
      approvedServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      earnings: earningsAgg[0]?.total || 0,
      rating: req.user.rating,
    },
    recentBookings,
    alerts,
  })
})

// @desc Add service
// @route POST /api/vendor/services
export const createService = asyncHandler(async (req, res) => {
  const { categoryId, title, description, price, discountPrice, estimatedTime, images, serviceArea, availability } =
    req.body

  if (!categoryId || !title || !price) {
    res.status(400)
    throw new Error('Category, title and price are required')
  }

  const service = await Service.create({
    vendorId: req.user._id,
    categoryId,
    title,
    description,
    price,
    discountPrice: discountPrice || 0,
    estimatedTime,
    images: images || [],
    serviceArea: serviceArea || [],
    availability: availability !== undefined ? availability : true,
    status: 'pending',
  })

  res.status(201).json({ success: true, service })
})

// @desc Get vendor's services
// @route GET /api/vendor/services
export const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ vendorId: req.user._id })
    .populate('categoryId', 'name')
    .sort('-createdAt')
  res.json({ success: true, count: services.length, services })
})

// @desc Update service
// @route PUT /api/vendor/services/:id
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, vendorId: req.user._id })
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }

  const fields = [
    'categoryId',
    'title',
    'description',
    'price',
    'discountPrice',
    'estimatedTime',
    'images',
    'serviceArea',
    'availability',
    'isActive',
  ]
  fields.forEach((f) => {
    if (req.body[f] !== undefined) service[f] = req.body[f]
  })
  // Re-submit for approval after edit
  service.status = 'pending'

  const updated = await service.save()
  res.json({ success: true, service: updated })
})

// @desc Delete service
// @route DELETE /api/vendor/services/:id
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, vendorId: req.user._id })
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  await service.deleteOne()
  res.json({ success: true, message: 'Service deleted' })
})

// @desc Get vendor bookings
// @route GET /api/vendor/bookings
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, payment } = req.query
  const query = { vendorId: req.user._id }
  if (status) query.bookingStatus = status
  if (payment) query.paymentStatus = payment
  const bookings = await Booking.find(query)
    .populate('userId', 'name phone email')
    .populate('serviceId', 'title')
    .sort('-createdAt')
  res.json({ success: true, count: bookings.length, bookings })
})

// @desc Update booking status
// @route PUT /api/vendor/bookings/:id/status
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingStatus, vendorNote, paymentStatus } = req.body
  const booking = await Booking.findOne({ _id: req.params.id, vendorId: req.user._id })
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }

  if (bookingStatus) booking.bookingStatus = bookingStatus
  if (vendorNote !== undefined) booking.vendorNote = vendorNote
  if (paymentStatus) booking.paymentStatus = paymentStatus

  // On completion, accumulate vendor earnings if paid
  if (bookingStatus === 'completed' && booking.paymentStatus === 'paid') {
    await Vendor.findByIdAndUpdate(req.user._id, { $inc: { totalEarnings: booking.price } })
  }

  await booking.save()
  res.json({ success: true, booking })
})

// @desc Vendor earnings
// @route GET /api/vendor/earnings
export const getEarnings = asyncHandler(async (req, res) => {
  const vendorId = req.user._id
  const paidBookings = await Booking.find({ vendorId, paymentStatus: 'paid' })
    .populate('serviceId', 'title')
    .populate('userId', 'name')
    .sort('-createdAt')

  const total = paidBookings.reduce((sum, b) => sum + b.price, 0)
  res.json({ success: true, total, count: paidBookings.length, bookings: paidBookings })
})

// @desc Vendor reviews
// @route GET /api/vendor/reviews
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ vendorId: req.user._id })
    .populate('userId', 'name')
    .populate('serviceId', 'title')
    .sort('-createdAt')
  res.json({ success: true, reviews })
})

// @desc Manage unavailable dates
// @route PUT /api/vendor/availability
export const updateAvailability = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.user._id)
  if (req.body.workingHours) vendor.workingHours = req.body.workingHours
  if (req.body.unavailableDates) vendor.unavailableDates = req.body.unavailableDates
  await vendor.save()
  res.json({ success: true, vendor })
})
