import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Settings from '../models/Settings.js'
import { syncAdminNotifications, markAdminNotificationsRead } from '../utils/notifications.js'
import { defaultUserSiteTheme, mergeUserSiteTheme } from '../utils/defaultUserSiteTheme.js'
import { toGeoPoint } from '../utils/geo.js'

// ---------- Vendors ----------

const applyVendorLocation = (vendor, body) => {
  if (body.address !== undefined) vendor.address = body.address
  if (body.city !== undefined) vendor.city = body.city
  if (body.pincode !== undefined) vendor.pincode = body.pincode
  if (body.lat !== undefined || body.lng !== undefined || body.latitude !== undefined || body.longitude !== undefined) {
    const point = toGeoPoint(body.lat ?? body.latitude, body.lng ?? body.longitude)
    if (point) vendor.location = point
  }
}

// @desc Create vendor account
// @route POST /api/admin/vendors
export const createVendor = asyncHandler(async (req, res) => {
  const { name, email, phone, password, businessName, serviceAreas, address, city, pincode, lat, lng } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email and password are required')
  }
  if (!city || !address) {
    res.status(400)
    throw new Error('Vendor city and address are required for nearest allocation')
  }
  const point = toGeoPoint(lat, lng)
  if (!point) {
    res.status(400)
    throw new Error('Valid latitude and longitude are required so customers can find nearby vendors')
  }

  const exists = await Vendor.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('Vendor email already exists')
  }

  const vendor = await Vendor.create({
    name,
    email,
    phone,
    password,
    businessName,
    serviceAreas: serviceAreas || [],
    address,
    city,
    pincode: pincode || '',
    location: point,
    createdByAdmin: true,
  })

  res.status(201).json({ success: true, vendor })
})

// @desc Get all vendors
// @route GET /api/admin/vendors
export const getVendors = asyncHandler(async (req, res) => {
  const { search } = req.query
  const query = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {}
  const vendors = await Vendor.find(query).sort('-createdAt')
  res.json({ success: true, count: vendors.length, vendors })
})

// @desc Update vendor (edit / block)
// @route PUT /api/admin/vendors/:id
export const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
  if (!vendor) {
    res.status(404)
    throw new Error('Vendor not found')
  }

  const fields = ['name', 'email', 'phone', 'businessName', 'serviceAreas', 'status', 'profileImage']
  fields.forEach((f) => {
    if (req.body[f] !== undefined) vendor[f] = req.body[f]
  })
  applyVendorLocation(vendor, req.body)
  if (req.body.password) vendor.password = req.body.password

  const updated = await vendor.save()
  res.json({ success: true, vendor: updated })
})

// @desc Delete vendor
// @route DELETE /api/admin/vendors/:id
export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
  if (!vendor) {
    res.status(404)
    throw new Error('Vendor not found')
  }
  await Service.deleteMany({ vendorId: vendor._id })
  await vendor.deleteOne()
  res.json({ success: true, message: 'Vendor deleted' })
})

// @desc Vendor-wise performance
// @route GET /api/admin/vendors/:id/performance
export const getVendorPerformance = asyncHandler(async (req, res) => {
  const vendorId = req.params.id
  const [services, bookings, completed] = await Promise.all([
    Service.countDocuments({ vendorId }),
    Booking.countDocuments({ vendorId }),
    Booking.countDocuments({ vendorId, bookingStatus: 'completed' }),
  ])
  const vendor = await Vendor.findById(vendorId)
  res.json({
    success: true,
    performance: { vendor, services, bookings, completed, earnings: vendor?.totalEarnings || 0 },
  })
})

// ---------- Users ----------

// @desc Get all users
// @route GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).sort('-createdAt')
  res.json({ success: true, count: users.length, users })
})

// @desc Block / unblock user
// @route PUT /api/admin/users/:id/block
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  user.isBlocked = !user.isBlocked
  await user.save()
  res.json({ success: true, isBlocked: user.isBlocked })
})

// @desc Delete user
// @route DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  await user.deleteOne()
  res.json({ success: true, message: 'User deleted' })
})

// @desc User booking history
// @route GET /api/admin/users/:id/bookings
export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.params.id })
    .populate('serviceId', 'title')
    .populate('vendorId', 'name businessName')
    .sort('-createdAt')
  res.json({ success: true, bookings })
})

// ---------- Services ----------

// @desc Get all services
// @route GET /api/admin/services
export const getAllServices = asyncHandler(async (req, res) => {
  const { status } = req.query
  const query = status ? { status } : {}
  const services = await Service.find(query)
    .populate('vendorId', 'name businessName')
    .populate('categoryId', 'name')
    .sort('-createdAt')
  res.json({ success: true, count: services.length, services })
})

// @desc Approve service
// @route PUT /api/admin/services/:id/approve
export const approveService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  service.status = 'approved'
  await service.save()
  res.json({ success: true, service })
})

// @desc Reject service
// @route PUT /api/admin/services/:id/reject
export const rejectService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error('Service not found')
  }
  service.status = 'rejected'
  await service.save()
  res.json({ success: true, service })
})

// ---------- Bookings ----------

// @desc Get all bookings
// @route GET /api/admin/bookings
export const getAllBookings = asyncHandler(async (req, res) => {
  const { status, payment } = req.query
  const query = {}
  if (status) query.bookingStatus = status
  if (payment) query.paymentStatus = payment
  const bookings = await Booking.find(query)
    .populate('userId', 'name email phone')
    .populate('vendorId', 'name businessName')
    .populate('serviceId', 'title')
    .sort('-createdAt')
  res.json({ success: true, count: bookings.length, bookings })
})

// @desc Update payment status (admin) — booking status is managed by the vendor only
// @route PUT /api/admin/bookings/:id
export const updateBookingByAdmin = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  if (req.body.bookingStatus) {
    res.status(403)
    throw new Error('Booking status can only be changed by the vendor who owns the booking')
  }
  if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus
  await booking.save()
  res.json({ success: true, booking })
})

// ---------- Reviews ----------

// @desc Get all reviews / complaints
// @route GET /api/admin/reviews
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('userId', 'name')
    .populate('serviceId', 'title')
    .populate('vendorId', 'name businessName')
    .sort('-createdAt')
  res.json({ success: true, reviews })
})

// @desc Delete review
// @route DELETE /api/admin/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }
  await review.deleteOne()
  res.json({ success: true, message: 'Review deleted' })
})

// ---------- Settings ----------

// @desc Get platform settings
// @route GET /api/admin/settings
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton()
  res.json({ success: true, settings })
})

// @desc Update platform settings
// @route PUT /api/admin/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton()
  const { siteName, supportEmail, commission, serviceRadiusKm } = req.body
  if (siteName !== undefined) settings.siteName = siteName
  if (supportEmail !== undefined) settings.supportEmail = supportEmail
  if (commission !== undefined) settings.commission = commission
  if (serviceRadiusKm !== undefined) {
    const radius = Number(serviceRadiusKm)
    if (!Number.isFinite(radius) || radius < 1 || radius > 500) {
      res.status(400)
      throw new Error('Service radius must be between 1 and 500 km')
    }
    settings.serviceRadiusKm = radius
  }
  await settings.save()
  res.json({ success: true, settings })
})

// @desc Get user-site theme for customizer
// @route GET /api/admin/site-theme
export const getUserSiteTheme = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton()
  res.json({
    success: true,
    siteName: settings.siteName,
    theme: mergeUserSiteTheme(defaultUserSiteTheme, settings.userSiteTheme),
  })
})

// @desc Update user-site theme (no-code customizer)
// @route PUT /api/admin/site-theme
export const updateUserSiteTheme = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton()
  const { siteName, theme, reset } = req.body
  if (siteName !== undefined) settings.siteName = siteName
  if (reset) {
    settings.userSiteTheme = { ...defaultUserSiteTheme }
  } else if (theme) {
    settings.userSiteTheme = mergeUserSiteTheme(
      mergeUserSiteTheme(defaultUserSiteTheme, settings.userSiteTheme),
      theme,
    )
  }
  await settings.save()
  res.json({
    success: true,
    siteName: settings.siteName,
    theme: mergeUserSiteTheme(defaultUserSiteTheme, settings.userSiteTheme),
  })
})

// ---------- Dashboard ----------

// @desc Dashboard analytics
// @route GET /api/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalServices,
    totalBookings,
    pendingBookings,
    completedBookings,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Vendor.countDocuments(),
    Service.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'pending' }),
    Booking.countDocuments({ bookingStatus: 'completed' }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]),
  ])

  const revenue = revenueAgg[0]?.total || 0

  const recentBookings = await Booking.find()
    .populate('userId', 'name')
    .populate('serviceId', 'title')
    .sort('-createdAt')
    .limit(5)

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalVendors,
      totalServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      revenue,
    },
    recentBookings,
  })
})

// @desc Admin notifications (last 3 days)
// @route GET /api/admin/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, unreadCount } = await syncAdminNotifications()
  res.json({ success: true, notifications, unreadCount })
})

// @desc Mark all admin notifications as read
// @route PUT /api/admin/notifications/read
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const { notifications, unreadCount } = await markAdminNotificationsRead()
  res.json({ success: true, notifications, unreadCount })
})
