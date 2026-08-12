import { Router } from 'express'
import { createFood, deleteFood, getFoods, updateFood } from '../controllers/foodController.js'

const router = Router()

router.get('/', getFoods)
router.post('/', createFood)
router.put('/:id', updateFood)
router.delete('/:id', deleteFood)

export default router
