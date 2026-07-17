import express from 'express'
import {
  createVendor,
  getVendors,
  updateVendor,
  deleteVendor,
  getVendorPerformance,
  getUsers,
  toggleBlockUser,
  deleteUser,
  getUserBookings,
  getAllServices,
  approveService,
  rejectService,
  getAllBookings,
  updateBookingByAdmin,
  getAllReviews,
  deleteReview,
  getSettings,
  updateSettings,
  getUserSiteTheme,
  updateUserSiteTheme,
  getDashboard,
  getNotifications,
  markNotificationsRead,
} from '../controllers/adminController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/dashboard', getDashboard)
router.get('/notifications', getNotifications)
router.put('/notifications/read', markNotificationsRead)

router.route('/vendors').post(createVendor).get(getVendors)
router.route('/vendors/:id').put(updateVendor).delete(deleteVendor)
router.get('/vendors/:id/performance', getVendorPerformance)

router.get('/users', getUsers)
router.put('/users/:id/block', toggleBlockUser)
router.delete('/users/:id', deleteUser)
router.get('/users/:id/bookings', getUserBookings)

router.get('/services', getAllServices)
router.put('/services/:id/approve', approveService)
router.put('/services/:id/reject', rejectService)

router.get('/bookings', getAllBookings)
router.put('/bookings/:id', updateBookingByAdmin)

router.get('/reviews', getAllReviews)
router.delete('/reviews/:id', deleteReview)

router.route('/settings').get(getSettings).put(updateSettings)
router.route('/site-theme').get(getUserSiteTheme).put(updateUserSiteTheme)

export default router
