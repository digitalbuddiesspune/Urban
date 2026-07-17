import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['admin', 'vendor'], required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    refKey: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '/' },
    severity: { type: String, enum: ['urgent', 'warning', 'info'], default: 'info' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
)

notificationSchema.index({ role: 1, recipientId: 1, refKey: 1 }, { unique: true })
notificationSchema.index({ role: 1, recipientId: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
