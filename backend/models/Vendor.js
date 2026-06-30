import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: 'vendor' },
    businessName: { type: String, trim: true },
    serviceAreas: [{ type: String }],
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    createdByAdmin: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    unavailableDates: [{ type: Date }],
  },
  { timestamps: true }
)

vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

vendorSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

const Vendor = mongoose.model('Vendor', vendorSchema)
export default Vendor
