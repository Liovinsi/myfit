import { dailyRoutine, dailyRoutineItemIds } from '../data/dailyRoutine.js'
import RoutineCompletion from '../models/RoutineCompletion.js'
import { dateKeyFromRequest } from '../utils/nutrition.js'

export async function getRoutine(req, res, next) {
  try {
    const dateKey = req.params.date || dateKeyFromRequest(req)
    const completion = await RoutineCompletion.findOne({ dateKey }).lean()
    const completedItems = completion?.completedItems || []

    res.json({
      dateKey,
      routine: dailyRoutine,
      completedItems,
      completionPercent: Math.round((completedItems.length / dailyRoutineItemIds.length) * 100)
    })
  } catch (error) {
    next(error)
  }
}

export async function saveRoutineProgress(req, res, next) {
  try {
    const dateKey = req.body.dateKey || dateKeyFromRequest(req)

    if (!Array.isArray(req.body.completedItems)) {
      return res.status(400).json({ message: 'completedItems array is required' })
    }

    const validIds = new Set(dailyRoutineItemIds)
    const completedItems = [...new Set(req.body.completedItems.filter((id) => validIds.has(id)))]

    const completion = await RoutineCompletion.findOneAndUpdate(
      { dateKey },
      { $set: { completedItems }, $setOnInsert: { dateKey } },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json({
      dateKey,
      routine: dailyRoutine,
      completedItems: completion.completedItems,
      completionPercent: Math.round((completion.completedItems.length / dailyRoutineItemIds.length) * 100)
    })
  } catch (error) {
    next(error)
  }
}
