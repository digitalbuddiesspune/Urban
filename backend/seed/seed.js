import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Vendor from '../models/Vendor.js'
import Service from '../models/Service.js'
import { CATALOGUE, OLD_CATEGORY_NAMES } from './catalogue.js'

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const serviceSlug = (title) =>
  `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const seed = async () => {
  try {
    await connectDB()

    // Admin account (optional — only if env vars set)
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    if (adminEmail && adminPassword) {
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
    } else {
      console.log('Skipping admin seed (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set)')
    }

    // Demo vendor for catalogue services
    const vendorEmail = process.env.SEED_VENDOR_EMAIL || 'vendor@urbanease.com'
    const vendorPassword = process.env.SEED_VENDOR_PASSWORD || 'vendor123'
    let vendor = await Vendor.findOne({ email: vendorEmail })
    if (!vendor) {
      vendor = await Vendor.create({
        name: process.env.SEED_VENDOR_NAME || 'UrbanEase Pros',
        email: vendorEmail,
        phone: process.env.SEED_VENDOR_PHONE || '9999999999',
        password: vendorPassword,
        businessName: process.env.SEED_VENDOR_BUSINESS || 'UrbanEase Demo Vendor',
        serviceAreas: ['Pune', 'Mumbai', 'Delhi'],
        city: 'Pune',
        status: 'active',
      })
      console.log(`Vendor created -> ${vendorEmail}`)
    } else {
      console.log(`Vendor ready -> ${vendorEmail}`)
    }

    const activeCategoryNames = []

    for (const cat of CATALOGUE) {
      const category = await Category.findOneAndUpdate(
        { name: cat.name },
        {
          name: cat.name,
          description: cat.description,
          image: cat.image,
          slug: slugify(cat.name),
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      activeCategoryNames.push(category.name)
      console.log(`Category synced -> ${category.name}`)

      for (const svc of cat.services) {
        const existing = await Service.findOne({
          title: svc.title,
          categoryId: category._id,
          vendorId: vendor._id,
        })

        const payload = {
          title: svc.title,
          description: `${svc.title} by verified professionals at your doorstep.`,
          price: svc.price,
          discountPrice: svc.discountPrice || 0,
          estimatedTime: '45-90 mins',
          images: [svc.image],
          serviceArea: ['Pune', 'Mumbai', 'Delhi'],
          availability: true,
          status: 'approved',
          isActive: true,
          rating: svc.rating,
          numReviews: Math.floor(svc.rating * 40),
          categoryId: category._id,
          vendorId: vendor._id,
        }

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          console.log(`  Service updated -> ${svc.title}`)
        } else {
          await Service.create({ ...payload, slug: serviceSlug(svc.title) })
          console.log(`  Service created -> ${svc.title}`)
        }
      }
    }

    // Deactivate legacy categories replaced by the new catalogue
    const legacy = await Category.updateMany(
      { name: { $in: OLD_CATEGORY_NAMES } },
      { isActive: false }
    )
    if (legacy.modifiedCount) {
      console.log(`Deactivated ${legacy.modifiedCount} legacy categor(ies)`)
    }

    console.log(`\nSeeding complete! ${activeCategoryNames.length} categories ready.`)
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
