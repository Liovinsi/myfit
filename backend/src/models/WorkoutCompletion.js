import mongoose from 'mongoose'

const workoutCompletionSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    workoutName: {
      type: String,
      required: true,
      trim: true
    },
    completedExercises: {
      type: [String],
      default: []
    },
    cardioCompleted: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

export default mongoose.model('WorkoutCompletion', workoutCompletionSchema)
