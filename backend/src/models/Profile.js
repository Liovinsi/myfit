import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Vidya'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

export default mongoose.model('Profile', profileSchema)
