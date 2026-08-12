import mongoose from 'mongoose'

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General'
    },
    defaultQuantity: {
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
      calories: {
        type: Number,
        required: true,
        min: 0
      },
      protein: {
        type: Number,
        required: true,
        min: 0
      },
      fiber: {
        type: Number,
        required: true,
        min: 0
      }
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

export default mongoose.model('Food', foodSchema)
