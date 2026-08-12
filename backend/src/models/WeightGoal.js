import mongoose from 'mongoose'

const weightGoalSchema = new mongoose.Schema(
  {
    targetWeightKg: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
)

export default mongoose.model('WeightGoal', weightGoalSchema)
