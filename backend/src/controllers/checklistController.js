import DailyChecklist from '../models/DailyChecklist.js'
import DailyStats from '../models/DailyStats.js'
import DietEntry from '../models/DietEntry.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { dateKeyFromRequest } from '../utils/nutrition.js'

const WATER_TARGET_ML = 3000
const PROTEIN_TARGET_G = 70

async function buildChecklist(dateKey) {
  const [workout, stats, entries, checklist] = await Promise.all([
    WorkoutCompletion.findOne({ dateKey }).lean(),
    DailyStats.findOne({ dateKey }).lean(),
    DietEntry.find({ dateKey }).lean(),
    DailyChecklist.findOne({ dateKey }).lean()
  ])

  const proteinConsumed = Math.round(
    entries.reduce((sum, entry) => sum + (entry.nutrition?.protein || 0), 0) * 10
  ) / 10

  const items = {
    workoutCompleted: Boolean(workout?.completed),
    cardioCompleted: Boolean(workout?.cardioCompleted),
    water3L: (stats?.waterMl || 0) >= WATER_TARGET_ML,
    dietFollowed: Boolean(checklist?.dietFollowed),
    proteinGoalReached: proteinConsumed >= PROTEIN_TARGET_G
  }

  const completedCount = Object.values(items).filter(Boolean).length
  const totalCount = Object.keys(items).length

  return {
    dateKey,
    items,
    waterMl: stats?.waterMl || 0,
    proteinConsumed,
    completedCount,
    totalCount,
    completionPercent: Math.round((completedCount / totalCount) * 100)
  }
}

export async function getChecklist(req, res, next) {
  try {
    const dateKey = req.params.date || dateKeyFromRequest(req)
    res.json(await buildChecklist(dateKey))
  } catch (error) {
    next(error)
  }
}

export async function setDietFollowed(req, res, next) {
  try {
    const dateKey = req.body.dateKey || dateKeyFromRequest(req)

    if (typeof req.body.dietFollowed !== 'boolean') {
      return res.status(400).json({ message: 'dietFollowed boolean is required' })
    }

    await DailyChecklist.findOneAndUpdate(
      { dateKey },
      { $set: { dietFollowed: req.body.dietFollowed }, $setOnInsert: { dateKey } },
      { upsert: true, runValidators: true }
    )

    res.json(await buildChecklist(dateKey))
  } catch (error) {
    next(error)
  }
}
