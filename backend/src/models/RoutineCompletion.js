import mongoose from 'mongoose'

const routineCompletionSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    completedItems: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

export default mongoose.model('RoutineCompletion', routineCompletionSchema)
