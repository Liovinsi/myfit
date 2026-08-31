import { Router } from 'express'
import { getRoutine, saveRoutineProgress } from '../controllers/routineController.js'

const router = Router()

router.get('/:date', getRoutine)
router.get('/', getRoutine)
router.patch('/', saveRoutineProgress)

export default router
