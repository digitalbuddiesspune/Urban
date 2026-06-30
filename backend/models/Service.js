import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    estimatedTime: { type: String, default: '' },
    images: [{ type: String }],
    serviceArea: [{ type: String }],
    availability: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
)

serviceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug =
      this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36)
  }
  next()
})

const Service = mongoose.model('Service', serviceSchema)
export default Service
