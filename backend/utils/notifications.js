import Notification from '../models/Notification.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Vendor from '../models/Vendor.js'

export const threeDaysAgo = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

const statusLabel = (s = '') =>
  String(s)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const severityForBookingStatus = (status) => {
  if (['pending', 'rejected', 'cancelled'].includes(status)) return 'urgent'
  if (['accepted', 'in_progress'].includes(status)) return 'warning'
  return 'info'
}

const severityForPayment = (status) => {
  if (status === 'failed') return 'urgent'
  if (status === 'pending' || status === 'refunded') return 'warning'
  return 'info'
}

/**
 * Upsert a notification.
 * - New items start unread
 * - If title/message/severity change (e.g. status update), mark unread again
 */
export const upsertNotification = async ({
  role,
  recipientId = null,
  refKey,
  type,
  title,
  message,
  link,
  severity = 'info',
  createdAt,
}) => {
  const filter = { role, recipientId: recipientId || null, refKey }
  const existing = await Notification.findOne(filter)
  const eventAt = createdAt ? new Date(createdAt) : new Date()

  if (existing) {
    const changed =
      existing.title !== title || existing.message !== message || existing.severity !== severity
    existing.type = type
    existing.title = title
    existing.message = message
    existing.link = link
    existing.severity = severity
    if (changed) {
      existing.isRead = false
      existing.createdAt = eventAt
    }
    await existing.save()
    return existing
  }

  const doc = new Notification({
    role,
    recipientId: recipientId || null,
    refKey,
    type,
    title,
    message,
    link,
    severity,
    isRead: false,
  })
  doc.createdAt = eventAt
  doc.updatedAt = eventAt
  await doc.save()
  return doc
}

const buildBookingItems = (booking, role) => {
  const serviceTitle = booking.serviceId?.title || 'a service'
  const customer = booking.userId?.name || 'A customer'
  const vendorName = booking.vendorId?.businessName || booking.vendorId?.name || 'A vendor'
  const when = booking.updatedAt || booking.createdAt
  const items = []

  items.push({
    refKey: `booking:${booking._id}:status`,
    type: 'booking_status',
    title: `Booking ${statusLabel(booking.bookingStatus)}`,
    message:
      role === 'admin'
        ? `${customer} · ${serviceTitle} · ${vendorName}`
        : `${customer} booked ${serviceTitle}`,
    link: `/bookings?status=${booking.bookingStatus}`,
    severity: severityForBookingStatus(booking.bookingStatus),
    createdAt: when,
  })

  if (['pending', 'failed', 'refunded'].includes(booking.paymentStatus)) {
    items.push({
      refKey: `booking:${booking._id}:payment`,
      type: 'payment',
      title: `Payment ${statusLabel(booking.paymentStatus)}`,
      message:
        role === 'admin'
          ? `${customer} · ${serviceTitle} · ${vendorName}`
          : `${customer} · ${serviceTitle}`,
      link: `/bookings?payment=${booking.paymentStatus}`,
      severity: severityForPayment(booking.paymentStatus),
      createdAt: when,
    })
  }

  return items
}

export const syncAdminNotifications = async () => {
  const since = threeDaysAgo()

  const [bookings, services, reviews, blockedVendors] = await Promise.all([
    Booking.find({ updatedAt: { $gte: since } })
      .populate('userId', 'name')
      .populate('vendorId', 'name businessName')
      .populate('serviceId', 'title')
      .lean(),
    Service.find({ updatedAt: { $gte: since } })
      .populate('vendorId', 'name businessName')
      .lean(),
    Review.find({ createdAt: { $gte: since } })
      .populate('userId', 'name')
      .populate('serviceId', 'title')
      .lean(),
    Vendor.find({ status: 'blocked', updatedAt: { $gte: since } }).lean(),
  ])

  const ops = []

  for (const booking of bookings) {
    for (const item of buildBookingItems(booking, 'admin')) {
      ops.push(upsertNotification({ role: 'admin', recipientId: null, ...item }))
    }
    if (booking.paymentStatus === 'paid') {
      ops.push(
        Notification.deleteOne({
          role: 'admin',
          recipientId: null,
          refKey: `booking:${booking._id}:payment`,
        }),
      )
    }
  }

  for (const service of services) {
    const vendorName = service.vendorId?.businessName || service.vendorId?.name || 'A vendor'
    const severity =
      service.status === 'pending' ? 'urgent' : service.status === 'rejected' ? 'warning' : 'info'
    ops.push(
      upsertNotification({
        role: 'admin',
        recipientId: null,
        refKey: `service:${service._id}`,
        type: 'service',
        title: `Service ${statusLabel(service.status)}`,
        message: `${service.title} · ${vendorName}`,
        link: service.status === 'pending' ? '/services?status=pending' : '/services',
        severity,
        createdAt: service.updatedAt || service.createdAt,
      }),
    )
  }

  for (const review of reviews) {
    ops.push(
      upsertNotification({
        role: 'admin',
        recipientId: null,
        refKey: `review:${review._id}`,
        type: 'review',
        title: review.rating <= 2 ? 'Low rating review' : 'New review',
        message: `${review.userId?.name || 'Customer'} rated ${review.serviceId?.title || 'a service'} ${review.rating}★`,
        link: '/reviews',
        severity: review.rating <= 2 ? 'warning' : 'info',
        createdAt: review.createdAt,
      }),
    )
  }

  for (const vendor of blockedVendors) {
    ops.push(
      upsertNotification({
        role: 'admin',
        recipientId: null,
        refKey: `vendor:${vendor._id}:blocked`,
        type: 'vendor',
        title: 'Vendor blocked',
        message: `${vendor.businessName || vendor.name} is currently blocked`,
        link: '/vendors',
        severity: 'warning',
        createdAt: vendor.updatedAt || vendor.createdAt,
      }),
    )
  }

  await Promise.all(ops)
  await Notification.deleteMany({ role: 'admin', createdAt: { $lt: since } })

  return getAdminNotifications()
}

export const syncVendorNotifications = async (vendorId) => {
  const since = threeDaysAgo()
  const vendorQuery = { vendorId }

  const [bookings, services, reviews] = await Promise.all([
    Booking.find({ ...vendorQuery, updatedAt: { $gte: since } })
      .populate('userId', 'name')
      .populate('serviceId', 'title')
      .lean(),
    Service.find({ ...vendorQuery, updatedAt: { $gte: since } }).lean(),
    Review.find({ ...vendorQuery, createdAt: { $gte: since } })
      .populate('userId', 'name')
      .populate('serviceId', 'title')
      .lean(),
  ])

  const ops = []

  for (const booking of bookings) {
    for (const item of buildBookingItems(booking, 'vendor')) {
      ops.push(upsertNotification({ role: 'vendor', recipientId: vendorId, ...item }))
    }
    if (booking.paymentStatus === 'paid') {
      ops.push(
        Notification.deleteOne({
          role: 'vendor',
          recipientId: vendorId,
          refKey: `booking:${booking._id}:payment`,
        }),
      )
    }
  }

  for (const service of services) {
    const severity =
      service.status === 'rejected' ? 'urgent' : service.status === 'pending' ? 'warning' : 'info'
    ops.push(
      upsertNotification({
        role: 'vendor',
        recipientId: vendorId,
        refKey: `service:${service._id}`,
        type: 'service',
        title: `Service ${statusLabel(service.status)}`,
        message:
          service.status === 'pending'
            ? `${service.title} is waiting for admin approval`
            : service.status === 'rejected'
              ? `${service.title} was rejected — review and resubmit`
              : `${service.title} is live on the platform`,
        link: '/services',
        severity,
        createdAt: service.updatedAt || service.createdAt,
      }),
    )
  }

  for (const review of reviews) {
    ops.push(
      upsertNotification({
        role: 'vendor',
        recipientId: vendorId,
        refKey: `review:${review._id}`,
        type: 'review',
        title: review.rating <= 2 ? 'Low rating review' : 'New review',
        message: `${review.userId?.name || 'Customer'} rated ${review.serviceId?.title || 'your service'} ${review.rating}★`,
        link: '/reviews',
        severity: review.rating <= 2 ? 'warning' : 'info',
        createdAt: review.createdAt,
      }),
    )
  }

  await Promise.all(ops)
  await Notification.deleteMany({
    role: 'vendor',
    recipientId: vendorId,
    createdAt: { $lt: since },
  })

  return getVendorNotifications(vendorId)
}

export const getAdminNotifications = async () => {
  const since = threeDaysAgo()
  const notifications = await Notification.find({
    role: 'admin',
    createdAt: { $gte: since },
  })
    .sort('-createdAt')
    .lean()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  return { notifications, unreadCount }
}

export const getVendorNotifications = async (vendorId) => {
  const since = threeDaysAgo()
  const notifications = await Notification.find({
    role: 'vendor',
    recipientId: vendorId,
    createdAt: { $gte: since },
  })
    .sort('-createdAt')
    .lean()

  const unreadCount = notifications.filter((n) => !n.isRead).length
  return { notifications, unreadCount }
}

export const markAdminNotificationsRead = async () => {
  const since = threeDaysAgo()
  await Notification.updateMany(
    { role: 'admin', createdAt: { $gte: since }, isRead: false },
    { $set: { isRead: true } },
  )
  return getAdminNotifications()
}

export const markVendorNotificationsRead = async (vendorId) => {
  const since = threeDaysAgo()
  await Notification.updateMany(
    { role: 'vendor', recipientId: vendorId, createdAt: { $gte: since }, isRead: false },
    { $set: { isRead: true } },
  )
  return getVendorNotifications(vendorId)
}
