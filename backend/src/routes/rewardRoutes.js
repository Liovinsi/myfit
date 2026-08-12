import { Router } from 'express'
import { getRewards, getRewardsForDate } from '../controllers/rewardController.js'

const router = Router()

router.get('/', getRewards)
router.get('/:date', getRewardsForDate)

export default router
