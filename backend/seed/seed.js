import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Vendor from '../models/Vendor.js'

const categories = [
  {
    name: 'AC Repair',
    description: 'AC installation, servicing and repair by experts',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600',
  },
  {
    name: 'Electrician',
    description: 'Wiring, switches, fans and electrical fixes',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600',
  },
  {
    name: 'Plumbing',
    description: 'Taps, pipes, leakage and bathroom fittings',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600',
  },
  {
    name: 'Home Cleaning',
    description: 'Deep cleaning for home, kitchen and bathroom',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
  },
  {
    name: 'Salon at Home',
    description: 'Salon and grooming services at your doorstep',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
  },
  {
    name: 'Appliance Repair',
    description: 'Microwave, washing machine and appliance repair',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600',
  },
]

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const seed = async () => {
  try {
    await connectDB()

    // Admin account (credentials come from .env)
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    if (!adminEmail || !adminPassword) {
      throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env')
    }
    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
      admin = await User.create({
        name: process.env.SEED_ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        phone: process.env.SEED_ADMIN_PHONE || '',
        password: adminPassword,
        role: 'admin',
      })
      console.log(`Admin created -> ${adminEmail}`)
    } else {
      console.log('Admin already exists')
    }

    // Categories
    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name })
      if (!exists) {
        await Category.create({ ...cat, slug: slugify(cat.name) })
        console.log(`Category created -> ${cat.name}`)
      }
    }

    // Optional demo vendor (only if configured in .env)
    const vendorEmail = process.env.SEED_VENDOR_EMAIL
    const vendorPassword = process.env.SEED_VENDOR_PASSWORD
    if (vendorEmail && vendorPassword) {
      const existingVendor = await Vendor.findOne({ email: vendorEmail })
      if (!existingVendor) {
        await Vendor.create({
          name: process.env.SEED_VENDOR_NAME || 'Vendor',
          email: vendorEmail,
          phone: process.env.SEED_VENDOR_PHONE || '',
          password: vendorPassword,
          businessName: process.env.SEED_VENDOR_BUSINESS || '',
          serviceAreas: [],
        })
        console.log(`Vendor created -> ${vendorEmail}`)
      }
    }

    console.log('\nSeeding complete!')
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
