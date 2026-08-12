import { Router } from 'express'
import { getTodayChallenges, getWeeklyChallenges } from '../controllers/challengeController.js'

const router = Router()

router.get('/today', getTodayChallenges)
router.get('/weekly', getWeeklyChallenges)

export default router
