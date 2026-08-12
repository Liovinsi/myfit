import DailyStats from '../models/DailyStats.js'
import { todayDateKey } from '../utils/nutrition.js'

function emptyStats(dateKey) {
  return {
    dateKey,
    steps: 0,
    waterMl: 0
  }
}

function toNumber(value, fieldName) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} must be zero or greater`)
  }

  return Math.round(numberValue)
}

export async function getDailyStats(req, res, next) {
  try {
    const dateKey = req.params.date || todayDateKey()
    const stats = await DailyStats.findOne({ dateKey }).lean()

    res.json(stats || emptyStats(dateKey))
  } catch (error) {
    next(error)
  }
}

export async function upsertDailyStats(req, res, next) {
  try {
    const dateKey = req.body.dateKey || todayDateKey()
    const setUpdate = {}
    const incUpdate = {}

    if (req.body.steps !== undefined) {
      setUpdate.steps = toNumber(req.body.steps, 'Steps')
    }

    if (req.body.waterMl !== undefined) {
      setUpdate.waterMl = toNumber(req.body.waterMl, 'Water')
    }

    const waterDeltaMl = req.body.waterDeltaMl

    if (waterDeltaMl !== undefined) {
      if (req.body.waterMl !== undefined) {
        return res.status(400).json({ message: 'Use either waterMl or waterDeltaMl, not both' })
      }

      incUpdate.waterMl = toNumber(waterDeltaMl, 'Water increment')
    }

    if (Object.keys(setUpdate).length === 0 && Object.keys(incUpdate).length === 0) {
      return res.status(400).json({ message: 'Steps or water value is required' })
    }

    const update = { $setOnInsert: { dateKey } }

    if (Object.keys(setUpdate).length > 0) {
      update.$set = setUpdate
    }

    if (Object.keys(incUpdate).length > 0) {
      update.$inc = incUpdate
    }

    const stats = await DailyStats.findOneAndUpdate(
      { dateKey },
      update,
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json(stats)
  } catch (error) {
    if (error.message?.includes('must be zero or greater')) {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}
