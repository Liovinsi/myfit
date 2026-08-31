import mongoose from 'mongoose'

const dailyChecklistSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    dietFollowed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model('DailyChecklist', dailyChecklistSchema)
