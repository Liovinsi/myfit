import { Router } from 'express'
import {
  createProtein,
  deleteProtein,
  getProteins,
  updateProtein
} from '../controllers/proteinController.js'

const router = Router()

router.get('/', getProteins)
router.post('/', createProtein)
router.put('/:id', updateProtein)
router.delete('/:id', deleteProtein)

export default router
