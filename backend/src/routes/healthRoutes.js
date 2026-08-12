import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    app: 'MyFit',
    status: 'ok'
  })
})

export default router
