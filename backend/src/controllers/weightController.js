import WeightEntry from '../models/WeightEntry.js'
import WeightGoal from '../models/WeightGoal.js'
import { todayDateKey } from '../utils/nutrition.js'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function toPositiveWeightKg(value, fieldName = 'Weight') {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${fieldName} must be a positive number`)
  }

  return Math.round(numberValue * 10) / 10
}

export async function getWeightEntry(req, res, next) {
  try {
    const dateKey = req.params.dateKey || todayDateKey()
    const entry = await WeightEntry.findOne({ dateKey }).lean()

    res.json({ dateKey, entry })
  } catch (error) {
    next(error)
  }
}

export async function getLatestWeight(req, res, next) {
  try {
    const entry = await WeightEntry.findOne().sort({ dateKey: -1 }).lean()

    res.json({ entry })
  } catch (error) {
    next(error)
  }
}

export async function getWeightHistory(req, res, next) {
  try {
    const requestedLimit = Number(req.query.limit)
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.round(requestedLimit), 100)
      : 30

    const entries = await WeightEntry.find().sort({ dateKey: -1 }).limit(limit).lean()

    res.json({ entries })
  } catch (error) {
    next(error)
  }
}

export async function saveWeightEntry(req, res, next) {
  try {
    const dateKey = req.body.dateKey || todayDateKey()

    if (!DATE_KEY_PATTERN.test(dateKey)) {
      return res.status(400).json({ message: 'A valid date is required' })
    }

    const weightKg = toPositiveWeightKg(req.body.weightKg)

    const entry = await WeightEntry.findOneAndUpdate(
      { dateKey },
      { $set: { weightKg }, $setOnInsert: { dateKey } },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json({ entry })
  } catch (error) {
    if (error.message?.includes('must be a positive number')) {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}

export async function getWeightGoal(req, res, next) {
  try {
    const goal = await WeightGoal.findOne().lean()

    res.json({ targetWeightKg: goal?.targetWeightKg ?? null })
  } catch (error) {
    next(error)
  }
}

export async function saveWeightGoal(req, res, next) {
  try {
    const targetWeightKg = toPositiveWeightKg(req.body.targetWeightKg, 'Target weight')

    const goal = await WeightGoal.findOneAndUpdate(
      {},
      { $set: { targetWeightKg } },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json({ targetWeightKg: goal.targetWeightKg })
  } catch (error) {
    if (error.message?.includes('must be a positive number')) {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}
