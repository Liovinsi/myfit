import { Router } from 'express'
import {
  completeWorkout,
  getTodayWorkout,
  getWorkout,
  getWorkoutCompletion,
  getWorkouts,
  saveWorkoutProgress
} from '../controllers/workoutController.js'

const router = Router()

router.get('/', getWorkouts)
router.get('/today', getTodayWorkout)
router.get('/completion/:dateKey', getWorkoutCompletion)
router.post('/complete', completeWorkout)
router.patch('/progress', saveWorkoutProgress)
router.get('/:day', getWorkout)

export default router
