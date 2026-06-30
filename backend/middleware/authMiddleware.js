import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  let account
  if (decoded.role === 'vendor') {
    account = await Vendor.findById(decoded.id).select('-password')
    if (account && account.status === 'blocked') {
      res.status(403)
      throw new Error('Your account has been blocked')
    }
  } else {
    account = await User.findById(decoded.id).select('-password')
    if (account && account.isBlocked) {
      res.status(403)
      throw new Error('Your account has been blocked')
    }
  }

  if (!account) {
    res.status(401)
    throw new Error('Not authorized, account not found')
  }

  req.user = account
  req.role = decoded.role
  next()
})

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    res.status(403)
    throw new Error(`Access denied for role: ${req.role}`)
  }
  next()
}
