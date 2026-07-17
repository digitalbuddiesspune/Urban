import mongoose from 'mongoose'
import { defaultUserSiteTheme } from '../utils/defaultUserSiteTheme.js'

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'UrbanEase' },
    supportEmail: { type: String, default: '' },
    commission: { type: Number, default: 10 },
    /** Max distance (km) within which services are shown to customers with a location */
    serviceRadiusKm: { type: Number, default: 20, min: 1, max: 500 },
    userSiteTheme: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ ...defaultUserSiteTheme }),
    },
  },
  { timestamps: true }
)

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne()
  if (!settings) settings = await this.create({ userSiteTheme: { ...defaultUserSiteTheme } })
  if (!settings.userSiteTheme) {
    settings.userSiteTheme = { ...defaultUserSiteTheme }
    await settings.save()
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)
export default Settings
