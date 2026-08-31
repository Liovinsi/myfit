import DailyStats from '../models/DailyStats.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { getWorkoutByDay } from '../data/workoutPlan.js'
import { todayDateKey } from '../utils/nutrition.js'

function emptyStats(dateKey) {
  return {
    dateKey,
    steps: 0,
    waterMl: 0,
    caloriesBurned: 0,
    afreshCount: 0
  }
}

function weekdayFromDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}

function averageBurnFromRange(estimatedBurn) {
  if (!estimatedBurn) {
    return 0
  }

  const numbers = estimatedBurn.match(/\d+/g)

  if (!numbers || numbers.length === 0) {
    return 0
  }

  const values = numbers.map(Number)
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export async function getSuggestedCaloriesBurned(req, res, next) {
  try {
    const dateKey = req.params.date || todayDateKey()
    const day = weekdayFromDateKey(dateKey)
    const workout = getWorkoutByDay(day)
    const completion = await WorkoutCompletion.findOne({ dateKey }).lean()

    let suggested = 0

    if (workout && workout.day !== 'Sunday') {
      if (completion?.completed) {
        suggested += averageBurnFromRange(workout.estimatedBurn)
      }

      if (completion?.cardioCompleted) {
        suggested += 250
      }
    }

    res.json({ dateKey, suggestedCaloriesBurned: suggested })
  } catch (error) {
    next(error)
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

    if (req.body.caloriesBurned !== undefined) {
      setUpdate.caloriesBurned = toNumber(req.body.caloriesBurned, 'Calories burned')
    }

    if (req.body.afreshCount !== undefined) {
      setUpdate.afreshCount = toNumber(req.body.afreshCount, 'Afresh count')
    }

    const waterDeltaMl = req.body.waterDeltaMl

    if (waterDeltaMl !== undefined) {
      if (req.body.waterMl !== undefined) {
        return res.status(400).json({ message: 'Use either waterMl or waterDeltaMl, not both' })
      }

      incUpdate.waterMl = toNumber(waterDeltaMl, 'Water increment')
    }

    const afreshCountDelta = req.body.afreshCountDelta

    if (afreshCountDelta !== undefined) {
      if (req.body.afreshCount !== undefined) {
        return res.status(400).json({ message: 'Use either afreshCount or afreshCountDelta, not both' })
      }

      const delta = Number(afreshCountDelta)

      if (!Number.isFinite(delta)) {
        return res.status(400).json({ message: 'Afresh count increment must be a number' })
      }

      const current = await DailyStats.findOne({ dateKey }).lean()
      const currentCount = current?.afreshCount || 0
      setUpdate.afreshCount = Math.max(0, Math.round(currentCount + delta))
    }

    if (Object.keys(setUpdate).length === 0 && Object.keys(incUpdate).length === 0) {
      return res.status(400).json({ message: 'Steps, water, calories burned, or Afresh count is required' })
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
