import mongoose from 'mongoose'

const extraLogEntrySchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Drink', 'Workout', 'Water', 'Other']
    },
    // Food/Drink name, Workout activity, or the Other category's free-text description.
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      trim: true,
      default: ''
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other']
    },
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    duration: {
      type: String,
      trim: true,
      default: ''
    },
    caloriesBurned: {
      type: Number,
      min: 0
    },
    waterMl: {
      type: Number,
      min: 0
    },
    // Links a Food/Drink extra to the DietEntry created for it, so today's diet
    // totals stay in sync when the extra is edited or deleted.
    dietEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietEntry'
    }
  },
  { timestamps: true }
)

extraLogEntrySchema.index({ dateKey: 1, createdAt: 1 })

export default mongoose.model('ExtraLogEntry', extraLogEntrySchema)
