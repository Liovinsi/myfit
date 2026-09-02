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
import { requireMongoConnection } from './middleware/requireMongoConnection.js'
import { seedRegularFoods } from './seed/regularFoods.js'
import { seedProteinFoods } from './seed/proteinFoods.js'
import { uploadsDir } from './utils/uploadStorage.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

const defaultAllowedOrigins = [
  // Vite's default dev port, plus the next one it falls back to when 5173
  // is already taken (e.g. another local project running). Extra local
  // ports beyond these two can be added via CORS_ORIGINS without touching code.
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  // The deployed MyFit frontend (per this repo's GitHub "homepage" field,
  // set by the Vercel GitHub integration). Kept as a built-in default so
  // preflight works even before FRONTEND_URL is set on Render; FRONTEND_URL
  // below still overrides/extends this if the frontend moves to another domain.
  'https://myfit-blond.vercel.app'
]
const configuredAllowedOrigins = [process.env.FRONTEND_URL || '', process.env.CORS_ORIGINS || '']
  .join(',')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)
const allowedOrigins = [...defaultAllowedOrigins, ...configuredAllowedOrigins]

if (configuredAllowedOrigins.length > 0) {
  console.log('CORS: explicitly allowed origins from FRONTEND_URL/CORS_ORIGINS:', configuredAllowedOrigins)
}

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser requests (curl, server-to-server, health checks) send no Origin header.
      if (!origin) {
        return callback(null, true)
      }

      const normalizedOrigin = origin.replace(/\/$/, '')

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true)
      }

      try {
        // Allow any Vercel deployment (production + preview URLs) without needing
        // to hardcode the exact project domain.
        if (new URL(origin).hostname.endsWith('.vercel.app')) {
          return callback(null, true)
        }
      } catch {
        // Not a parseable origin, fall through to reject below.
      }

      console.warn(`CORS: rejected request from origin "${origin}". Allowed origins:`, allowedOrigins)
      // Pass `false`, not an Error: the `cors` package forwards an Error to
      // Express's error-handling middleware via next(err), which the generic
      // handler below turns into a bare 500 with no CORS headers at all. That
      // makes every rejected preflight look like a server crash instead of a
      // clean "origin not allowed" response. Passing `false` just omits the
      // Access-Control-Allow-Origin header, which is what actually makes the
      // browser report a CORS failure.
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.get('/', (_req, res) => {
  res.json({
    app: 'MyFit',
    tagline: 'Your Daily Fitness Journey'
  })
})

app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'MyFit',
    message: 'MyFit API is running'
  })
})

app.use('/api/health', healthRoutes)

app.use('/api/fooditems', requireMongoConnection, foodRoutes)
app.use('/api/foods', requireMongoConnection, foodRoutes)
app.use('/api/proteins', requireMongoConnection, proteinRoutes)
app.use('/api/foodlogs', requireMongoConnection, dietRoutes)
app.use('/api/diet', requireMongoConnection, dietRoutes)
// Workout routes are not blanket-guarded: the workout plan is static data and
// must stay available even when MongoDB is down (see workoutRoutes.js).
app.use('/api/workouts', workoutRoutes)
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

async function start() {
  try {
    await connectDB()

    if (mongoose.connection.readyState === 1) {
      await seedRegularFoods()
      await seedProteinFoods()
    }
  } catch (error) {
    // Don't let a MongoDB outage take down the whole API — routes that don't
    // need the database (like the static workout plan) must keep working.
    console.error('Starting without a database connection:', error.message)
  }

  app.listen(port, () => {
    console.log(`MyFit backend running on port ${port}`)
  })
}

start()
