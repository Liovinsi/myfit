import mongoose from 'mongoose'

const weightEntrySchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
)

export default mongoose.model('WeightEntry', weightEntrySchema)
