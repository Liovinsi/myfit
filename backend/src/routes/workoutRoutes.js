import { Router } from 'express'
import {
  completeWorkout,
  getTodayWorkout,
  getWorkout,
  getWorkoutCompletion,
  getWorkouts,
  saveWorkoutProgress
} from '../controllers/workoutController.js'
import { requireMongoConnection } from '../middleware/requireMongoConnection.js'

const router = Router()

// The workout plan itself is static data (backend/src/data/workoutPlan.js), so
// it must stay readable even when MongoDB is unavailable. Only the completion
// tracking endpoints below actually touch the database.
router.get('/', getWorkouts)
router.get('/today', requireMongoConnection, getTodayWorkout)
router.get('/completion/:dateKey', requireMongoConnection, getWorkoutCompletion)
router.post('/complete', requireMongoConnection, completeWorkout)
router.patch('/progress', requireMongoConnection, saveWorkoutProgress)
router.get('/:day', getWorkout)

export default router
