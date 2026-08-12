import { Router } from 'express'
import { getDailyStats, upsertDailyStats } from '../controllers/dailyStatsController.js'

const router = Router()

router.get('/:date', getDailyStats)
router.post('/', upsertDailyStats)

export default router
