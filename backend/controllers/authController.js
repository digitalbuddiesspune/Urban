import asyncHandler from '../utils/asyncHandler.js'
import generateToken from '../utils/generateToken.js'
import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import { toGeoPoint } from '../utils/geo.js'

// @desc Register a new user
// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please provide name, email and password')
  }

  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('Email already registered')
  }

  const user = await User.create({ name, email, phone, password, role: 'user' })

  res.status(201).json({
    success: true,
    token: generateToken(user._id, 'user'),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  })
})

// @desc Login (user / admin / vendor)
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please provide email and password')
  }

  // Try user/admin first
  let account = await User.findOne({ email }).select('+password')
  let role = account?.role

  // Else try vendor
  if (!account) {
    account = await Vendor.findOne({ email }).select('+password')
    role = 'vendor'
  }

  if (!account || !(await account.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (role === 'vendor' && account.status === 'blocked') {
    res.status(403)
    throw new Error('Your account has been blocked')
  }
  if (role !== 'vendor' && account.isBlocked) {
    res.status(403)
    throw new Error('Your account has been blocked')
  }

  res.json({
    success: true,
    token: generateToken(account._id, role),
    user: {
      _id: account._id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role,
      businessName: account.businessName,
    },
  })
})

// @desc Get current profile
// @route GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user, role: req.role })
})

// @desc Update profile
// @route PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const Model = req.role === 'vendor' ? Vendor : User
  const account = await Model.findById(req.user._id)

  if (!account) {
    res.status(404)
    throw new Error('Account not found')
  }

  account.name = req.body.name ?? account.name
  account.phone = req.body.phone ?? account.phone
  if (req.role === 'vendor') {
    account.businessName = req.body.businessName ?? account.businessName
    account.serviceAreas = req.body.serviceAreas ?? account.serviceAreas
    account.profileImage = req.body.profileImage ?? account.profileImage
    if (req.body.workingHours) account.workingHours = req.body.workingHours
    if (req.body.address !== undefined) account.address = req.body.address
    if (req.body.city !== undefined) account.city = req.body.city
    if (req.body.pincode !== undefined) account.pincode = req.body.pincode
    if (req.body.lat !== undefined || req.body.lng !== undefined) {
      const point = toGeoPoint(req.body.lat, req.body.lng)
      if (point) account.location = point
    }
  }

  const updated = await account.save()
  res.json({ success: true, user: updated })
})

// @desc Change password
// @route PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const Model = req.role === 'vendor' ? Vendor : User
  const account = await Model.findById(req.user._id).select('+password')

  if (!account || !(await account.matchPassword(currentPassword))) {
    res.status(401)
    throw new Error('Current password is incorrect')
  }

  account.password = newPassword
  await account.save()
  res.json({ success: true, message: 'Password updated successfully' })
})
