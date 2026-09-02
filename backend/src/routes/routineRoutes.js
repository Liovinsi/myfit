import { Router } from 'express'
import {
  addExtraItem,
  deleteExtraItem,
  getRoutine,
  saveRoutineProgress,
  updateExtraItem
} from '../controllers/routineController.js'

const router = Router()

router.post('/extra', addExtraItem)
router.patch('/extra/:id', updateExtraItem)
router.delete('/extra/:id', deleteExtraItem)
router.get('/:date', getRoutine)
router.get('/', getRoutine)
router.patch('/', saveRoutineProgress)

export default router
