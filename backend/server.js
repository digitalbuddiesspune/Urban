import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { validateEnv } from './config/validateEnv.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import vendorRoutes from './routes/vendorRoutes.js'
import userRoutes from './routes/userRoutes.js'

validateEnv()
connectDB()

const app = express()

const isProd = process.env.NODE_ENV === 'production'

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  ...(isProd
    ? {
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
          }
          console.warn(`CORS blocked origin: ${origin}`)
          return callback(null, false)
        },
      }
    : {
        // Development: allow any origin (localhost ports change when Vite bumps 5175 → 5176, etc.)
        origin: true,
      }),
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json())

console.log(`NODE_ENV=${process.env.NODE_ENV || 'undefined'} | CORS: ${isProd ? 'strict allowlist' : 'all origins allowed'}`)
if (isProd && allowedOrigins.length) {
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
