import express from 'express'
import {
  getCategories,
  getCities,
  getServices,
  getServiceById,
  getSiteTheme,
  createBooking,
  getMyBookings,
  cancelBooking,
  createReview,
  getAddresses,
  addAddress,
  setPrimaryAddress,
  deleteAddress,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public browsing
router.get('/categories', getCategories)
router.get('/cities', getCities)
router.get('/site-theme', getSiteTheme)
router.get('/services', getServices)
router.get('/services/:id', getServiceById)

// Protected user actions
router.use(protect, authorize('user'))
router.route('/bookings').post(createBooking).get(getMyBookings)
router.put('/bookings/:id/cancel', cancelBooking)
router.post('/reviews', createReview)
router.route('/addresses').get(getAddresses).post(addAddress)
router.put('/addresses/:addressId/primary', setPrimaryAddress)
router.delete('/addresses/:addressId', deleteAddress)
router.route('/cart').get(getCart).delete(clearCart)
router.post('/cart/items', addCartItem)
router.route('/cart/items/:serviceId').put(updateCartItem).delete(removeCartItem)

export default router
