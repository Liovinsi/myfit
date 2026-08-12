import { Router } from 'express'
import { getProgressHistory } from '../controllers/progressController.js'

const router = Router()

router.get('/history', getProgressHistory)

export default router
