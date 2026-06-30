import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'UrbanEase' },
    supportEmail: { type: String, default: '' },
    commission: { type: Number, default: 10 },
  },
  { timestamps: true }
)

// Always work with a single settings document
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne()
  if (!settings) settings = await this.create({})
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings
