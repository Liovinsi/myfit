import mongoose from 'mongoose'

const hundredDaysEntrySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

export default mongoose.model('HundredDaysEntry', hundredDaysEntrySchema)
