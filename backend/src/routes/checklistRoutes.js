import { Router } from 'express'
import { getChecklist, setDietFollowed } from '../controllers/checklistController.js'

const router = Router()

router.get('/:date', getChecklist)
router.get('/', getChecklist)
router.patch('/', setDietFollowed)

export default router
