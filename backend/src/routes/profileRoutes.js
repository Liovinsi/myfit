import { Router } from 'express'
import { getProfile, updateProfile, uploadProfileImage } from '../controllers/profileController.js'
import { uploadProfileImageMiddleware } from '../utils/uploadStorage.js'

const router = Router()

router.get('/', getProfile)
router.put('/', updateProfile)
router.post('/image', (req, res, next) => {
  uploadProfileImageMiddleware(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Image upload failed' })
    }

    next()
  })
}, uploadProfileImage)

export default router
