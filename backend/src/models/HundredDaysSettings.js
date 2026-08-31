import mongoose from 'mongoose'

const hundredDaysSettingsSchema = new mongoose.Schema(
  {
    startDateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    }
  },
  { timestamps: true }
)

export default mongoose.model('HundredDaysSettings', hundredDaysSettingsSchema)
