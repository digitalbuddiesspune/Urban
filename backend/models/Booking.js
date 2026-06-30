import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    price: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
    bookingStatus: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'on_the_way',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    userNote: { type: String, default: '' },
    vendorNote: { type: String, default: '' },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
