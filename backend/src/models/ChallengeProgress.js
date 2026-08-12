import mongoose from 'mongoose'

const challengeProgressSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true
    },
    period: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      required: true,
      default: 0
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    rewardClaimed: {
      type: Boolean,
      required: true,
      default: false
    },
    claimedAt: {
      type: Date
    }
  },
  { timestamps: true }
)

challengeProgressSchema.index({ challengeId: 1, period: 1 }, { unique: true })

export default mongoose.model('ChallengeProgress', challengeProgressSchema)
