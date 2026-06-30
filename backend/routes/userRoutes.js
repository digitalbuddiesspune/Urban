import express from 'express'
import {
  getCategories,
  getServices,
  getServiceById,
  createBooking,
  getMyBookings,
  cancelBooking,
  createReview,
  getAddresses,
  addAddress,
  deleteAddress,
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public browsing
router.get('/categories', getCategories)
router.get('/services', getServices)
router.get('/services/:id', getServiceById)

// Protected user actions
router.use(protect, authorize('user'))
router.route('/bookings').post(createBooking).get(getMyBookings)
router.put('/bookings/:id/cancel', cancelBooking)
router.post('/reviews', createReview)
router.route('/addresses').get(getAddresses).post(addAddress)
router.delete('/addresses/:addressId', deleteAddress)

export default router
