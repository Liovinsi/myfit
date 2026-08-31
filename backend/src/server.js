import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import challengeRoutes from './routes/challengeRoutes.js'
import checklistRoutes from './routes/checklistRoutes.js'
import dailyStatsRoutes from './routes/dailyStatsRoutes.js'
import dietRoutes from './routes/dietRoutes.js'
import foodRoutes from './routes/foodRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import hundredDaysRoutes from './routes/hundredDaysRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import proteinRoutes from './routes/proteinRoutes.js'
import rewardRoutes from './routes/rewardRoutes.js'
import routineRoutes from './routes/routineRoutes.js'
import weightRoutes from './routes/weightRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import { seedRegularFoods } from './seed/regularFoods.js'
import { seedProteinFoods } from './seed/proteinFoods.js'
import { uploadsDir } from './utils/uploadStorage.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.get('/', (_req, res) => {
  res.json({
    app: 'MyFit',
    tagline: 'Your Daily Fitness Journey'
  })
})

app.use('/api/health', healthRoutes)
function requireMongoConnection(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'MongoDB is not connected' })
  }

  next()
}

app.use('/api/fooditems', requireMongoConnection, foodRoutes)
app.use('/api/foods', requireMongoConnection, foodRoutes)
app.use('/api/proteins', requireMongoConnection, proteinRoutes)
app.use('/api/foodlogs', requireMongoConnection, dietRoutes)
app.use('/api/diet', requireMongoConnection, dietRoutes)
app.use('/api/workouts', requireMongoConnection, workoutRoutes)
app.use('/api/dailystats', requireMongoConnection, dailyStatsRoutes)
app.use('/api/weights', requireMongoConnection, weightRoutes)
app.use('/api/challenges', requireMongoConnection, challengeRoutes)
app.use('/api/progress', requireMongoConnection, progressRoutes)
app.use('/api/rewards', requireMongoConnection, rewardRoutes)
app.use('/api/routine', requireMongoConnection, routineRoutes)
app.use('/api/checklist', requireMongoConnection, checklistRoutes)
app.use('/api/hundred-days', requireMongoConnection, hundredDaysRoutes)
app.use('/api/profile', requireMongoConnection, profileRoutes)

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This item already exists' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message })
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  console.error(error)
  res.status(500).json({ message: 'Something went wrong' })
})

connectDB()
  .then(async () => {
    if (process.env.MONGODB_URI) {
      await seedRegularFoods()
      await seedProteinFoods()
    }
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`MyFit backend running on port ${port}`)
    })
  })
  .catch(() => {
    process.exit(1)
  })
