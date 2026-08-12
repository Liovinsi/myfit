import { Router } from 'express'
import {
  addSelectedFoods,
  getTodayDiet,
  removeDietEntry,
  updateDietQuantity
} from '../controllers/dietController.js'

const router = Router()

router.get('/today', getTodayDiet)
router.post('/today', addSelectedFoods)
router.patch('/today/:id', updateDietQuantity)
router.delete('/today/:id', removeDietEntry)
router.get('/:date', getTodayDiet)
router.post('/', addSelectedFoods)
router.put('/:id', updateDietQuantity)
router.delete('/:id', removeDietEntry)

export default router
