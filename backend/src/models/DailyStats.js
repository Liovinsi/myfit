import mongoose from 'mongoose'

const dailyStatsSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    steps: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    waterMl: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
)

export default mongoose.model('DailyStats', dailyStatsSchema)
