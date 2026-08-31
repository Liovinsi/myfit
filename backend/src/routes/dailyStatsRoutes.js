import { Router } from 'express'
import {
  getDailyStats,
  getSuggestedCaloriesBurned,
  upsertDailyStats
} from '../controllers/dailyStatsController.js'

const router = Router()

router.get('/suggested-burn/:date', getSuggestedCaloriesBurned)
router.get('/:date', getDailyStats)
router.post('/', upsertDailyStats)

export default router
