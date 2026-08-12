import mongoose from 'mongoose'

const dietEntrySchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      index: true
    },
    meal: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner']
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodSnapshot: {
      name: { type: String, required: true },
      category: { type: String, required: true },
      defaultQuantity: {
        amount: { type: Number, required: true },
        unit: { type: String, required: true }
      },
      nutrition: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        fiber: { type: Number, required: true }
      }
    },
    quantity: {
      amount: {
        type: Number,
        required: true,
        min: 0.01
      },
      unit: {
        type: String,
        required: true,
        trim: true
      }
    },
    nutrition: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, required: true, min: 0 },
      fiber: { type: Number, required: true, min: 0 }
    }
  },
  { timestamps: true }
)

dietEntrySchema.index({ dateKey: 1, meal: 1, food: 1 }, { unique: true })

export default mongoose.model('DietEntry', dietEntrySchema)
