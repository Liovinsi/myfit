import { Router } from 'express'
import {
  getHundredDaysChallenge,
  resetHundredDaysChallenge,
  toggleHundredDaysDay
} from '../controllers/hundredDaysController.js'

const router = Router()

router.get('/', getHundredDaysChallenge)
router.patch('/day/:dayNumber', toggleHundredDaysDay)
router.post('/reset', resetHundredDaysChallenge)

export default router
