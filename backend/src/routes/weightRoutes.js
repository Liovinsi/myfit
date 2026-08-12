import { Router } from 'express'
import {
  getLatestWeight,
  getWeightEntry,
  getWeightGoal,
  getWeightHistory,
  saveWeightEntry,
  saveWeightGoal
} from '../controllers/weightController.js'

const router = Router()

router.get('/history', getWeightHistory)
router.get('/latest', getLatestWeight)
router.get('/goal', getWeightGoal)
router.put('/goal', saveWeightGoal)
router.get('/:dateKey', getWeightEntry)
router.post('/', saveWeightEntry)

export default router
