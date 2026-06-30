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

app.use(cors())
app.use(express.json())

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
