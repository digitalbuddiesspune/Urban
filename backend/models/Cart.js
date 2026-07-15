import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    bookingDate: { type: String, default: '' },
    bookingTime: { type: String, default: '' },
    qty: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
)

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
)

const Cart = mongoose.model('Cart', cartSchema)
export default Cart
