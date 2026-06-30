import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import vendorRoutes from './routes/vendorRoutes.js'
import userRoutes from './routes/userRoutes.js'

connectDB()

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server) and any origin when none configured
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    console.warn(`CORS blocked origin: ${origin}`)
    return callback(null, false)
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

if (allowedOrigins.length) {
  console.log('CORS allowed origins:', allowedOrigins.join(', '))
}

app.get('/', (req, res) => {
  res.json({ success: true, message: 'UrbanEase API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api/user', userRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
