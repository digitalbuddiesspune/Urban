import mongoose from 'mongoose'
import { defaultUserSiteTheme } from '../utils/defaultUserSiteTheme.js'

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'UrbanEase' },
    supportEmail: { type: String, default: '' },
    commission: { type: Number, default: 10 },
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
