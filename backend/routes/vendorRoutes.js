import express from 'express'
import {
  getDashboard,
  createService,
  getMyServices,
  updateService,
  deleteService,
  getMyBookings,
  updateBookingStatus,
  getEarnings,
  getMyReviews,
  updateAvailability,
} from '../controllers/vendorController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, authorize('vendor'))

router.get('/dashboard', getDashboard)
router.route('/services').post(createService).get(getMyServices)
router.route('/services/:id').put(updateService).delete(deleteService)
router.get('/bookings', getMyBookings)
router.put('/bookings/:id/status', updateBookingStatus)
router.get('/earnings', getEarnings)
router.get('/reviews', getMyReviews)
router.put('/availability', updateAvailability)

export default router
