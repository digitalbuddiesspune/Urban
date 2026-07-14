import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Vendor from '../models/Vendor.js'

const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const alert = (id, title, message, count, severity, link) => ({
  id,
  title,
  message,
  count,
  severity,
  link,
})

export const buildAdminAlerts = async () => {
  const recentSince = sevenDaysAgo()

  const [
    pendingServices,
    pendingBookings,
    acceptedBookings,
    onTheWayBookings,
    inProgressBookings,
    rejectedBookings,
    cancelledBookings,
    completedBookings,
    pendingPayments,
    failedPayments,
    refundedPayments,
    lowRatingReviews,
    recentReviews,
    blockedVendors,
  ] = await Promise.all([
    Service.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ bookingStatus: 'pending' }),
    Booking.countDocuments({ bookingStatus: 'accepted' }),
    Booking.countDocuments({ bookingStatus: 'on_the_way' }),
    Booking.countDocuments({ bookingStatus: 'in_progress' }),
    Booking.countDocuments({ bookingStatus: 'rejected' }),
    Booking.countDocuments({ bookingStatus: 'cancelled' }),
    Booking.countDocuments({ bookingStatus: 'completed' }),
    Booking.countDocuments({ paymentStatus: 'pending', bookingStatus: { $nin: ['cancelled', 'rejected'] } }),
    Booking.countDocuments({ paymentStatus: 'failed' }),
    Booking.countDocuments({ paymentStatus: 'refunded' }),
    Review.countDocuments({ rating: { $lte: 2 } }),
    Review.countDocuments({ createdAt: { $gte: recentSince } }),
    Vendor.countDocuments({ status: 'blocked' }),
  ])

  return [
    alert('pending_services', 'Pending service approvals', 'Vendor services waiting for admin review', pendingServices, 'urgent', '/services?status=pending'),
    alert('pending_bookings', 'Pending bookings', 'New bookings awaiting vendor response', pendingBookings, 'urgent', '/bookings?status=pending'),
    alert('accepted_bookings', 'Accepted bookings', 'Vendors accepted — service not started yet', acceptedBookings, 'warning', '/bookings?status=accepted'),
    alert('on_the_way', 'On the way', 'Vendors are heading to customer locations', onTheWayBookings, 'info', '/bookings?status=on_the_way'),
    alert('in_progress', 'In progress', 'Services currently being performed', inProgressBookings, 'warning', '/bookings?status=in_progress'),
    alert('rejected_bookings', 'Rejected bookings', 'Bookings declined by vendors', rejectedBookings, 'info', '/bookings?status=rejected'),
    alert('cancelled_bookings', 'Cancelled bookings', 'Bookings cancelled by customers or vendors', cancelledBookings, 'info', '/bookings?status=cancelled'),
    alert('completed_bookings', 'Completed bookings', 'Successfully finished bookings', completedBookings, 'info', '/bookings?status=completed'),
    alert('pending_payments', 'Pending payments', 'Bookings with unpaid invoices', pendingPayments, 'warning', '/bookings?payment=pending'),
    alert('failed_payments', 'Failed payments', 'Payments that need attention', failedPayments, 'urgent', '/bookings?payment=failed'),
    alert('refunded_payments', 'Refunded payments', 'Payments that were refunded', refundedPayments, 'info', '/bookings?payment=refunded'),
    alert('low_rating_reviews', 'Low rating reviews', 'Reviews rated 2 stars or below', lowRatingReviews, 'warning', '/reviews'),
    alert('recent_reviews', 'Recent reviews', 'New customer reviews in the last 7 days', recentReviews, 'info', '/reviews'),
    alert('blocked_vendors', 'Blocked vendors', 'Vendor accounts currently blocked', blockedVendors, 'warning', '/vendors'),
  ]
}

export const buildVendorAlerts = async (vendorId) => {
  const recentSince = sevenDaysAgo()
  const vendorQuery = { vendorId }

  const [
    pendingServices,
    rejectedServices,
    approvedServices,
    pendingBookings,
    acceptedBookings,
    onTheWayBookings,
    inProgressBookings,
    rejectedBookings,
    cancelledBookings,
    completedBookings,
    pendingPayments,
    failedPayments,
    refundedPayments,
    lowRatingReviews,
    recentReviews,
  ] = await Promise.all([
    Service.countDocuments({ ...vendorQuery, status: 'pending' }),
    Service.countDocuments({ ...vendorQuery, status: 'rejected' }),
    Service.countDocuments({ ...vendorQuery, status: 'approved' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'pending' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'accepted' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'on_the_way' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'in_progress' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'rejected' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'cancelled' }),
    Booking.countDocuments({ ...vendorQuery, bookingStatus: 'completed' }),
    Booking.countDocuments({ ...vendorQuery, paymentStatus: 'pending', bookingStatus: { $nin: ['cancelled', 'rejected'] } }),
    Booking.countDocuments({ ...vendorQuery, paymentStatus: 'failed' }),
    Booking.countDocuments({ ...vendorQuery, paymentStatus: 'refunded' }),
    Review.countDocuments({ ...vendorQuery, rating: { $lte: 2 } }),
    Review.countDocuments({ ...vendorQuery, createdAt: { $gte: recentSince } }),
  ])

  return [
    alert('pending_bookings', 'Pending bookings', 'New requests — accept or reject', pendingBookings, 'urgent', '/bookings?status=pending'),
    alert('accepted_bookings', 'Accepted bookings', 'Mark as on the way when you leave', acceptedBookings, 'warning', '/bookings?status=accepted'),
    alert('on_the_way', 'On the way', 'Update status when you arrive', onTheWayBookings, 'info', '/bookings?status=on_the_way'),
    alert('in_progress', 'In progress', 'Mark complete when the job is done', inProgressBookings, 'warning', '/bookings?status=in_progress'),
    alert('pending_services', 'Services pending approval', 'Waiting for admin to approve', pendingServices, 'warning', '/services'),
    alert('rejected_services', 'Rejected services', 'Services declined by admin — review and resubmit', rejectedServices, 'urgent', '/services'),
    alert('approved_services', 'Approved services', 'Live services on the platform', approvedServices, 'info', '/services'),
    alert('rejected_bookings', 'Rejected bookings', 'Bookings you declined', rejectedBookings, 'info', '/bookings?status=rejected'),
    alert('cancelled_bookings', 'Cancelled bookings', 'Bookings cancelled by customers', cancelledBookings, 'info', '/bookings?status=cancelled'),
    alert('completed_bookings', 'Completed bookings', 'Successfully finished jobs', completedBookings, 'info', '/bookings?status=completed'),
    alert('pending_payments', 'Pending payments', 'Unpaid bookings on your account', pendingPayments, 'warning', '/bookings?payment=pending'),
    alert('failed_payments', 'Failed payments', 'Payments that failed — follow up with customer', failedPayments, 'urgent', '/bookings?payment=failed'),
    alert('refunded_payments', 'Refunded payments', 'Payments refunded to customers', refundedPayments, 'info', '/bookings?payment=refunded'),
    alert('low_rating_reviews', 'Low rating reviews', 'Reviews rated 2 stars or below', lowRatingReviews, 'warning', '/reviews'),
    alert('recent_reviews', 'Recent reviews', 'New customer reviews in the last 7 days', recentReviews, 'info', '/reviews'),
  ]
}
