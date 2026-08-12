import mongoose from 'mongoose'

const coinTransactionSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    rewardType: {
      type: String,
      required: true,
      enum: ['workout', 'steps', 'water', 'challenge']
    },
    sourceId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    coins: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
)

coinTransactionSchema.index({ dateKey: 1, rewardType: 1, sourceId: 1 }, { unique: true })

export default mongoose.model('CoinTransaction', coinTransactionSchema)
