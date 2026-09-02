import mongoose from 'mongoose'
import { dailyRoutine, dailyRoutineItemIds, dailyRoutineItemsById } from '../data/dailyRoutine.js'
import DailyStats from '../models/DailyStats.js'
import DietEntry from '../models/DietEntry.js'
import ExtraLogEntry from '../models/ExtraLogEntry.js'
import RoutineCompletion from '../models/RoutineCompletion.js'
import { dateKeyFromRequest, roundNutrition } from '../utils/nutrition.js'

const CATEGORIES = new Set(['Food', 'Drink', 'Workout', 'Water', 'Other'])
const FOOD_DRINK_CATEGORIES = new Set(['Food', 'Drink'])
const MEAL_TYPES = new Set(['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other'])

class ValidationError extends Error {}

function toOptionalNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new ValidationError(`${fieldName} must be zero or greater`)
  }

  return roundNutrition(numberValue)
}

// Applies a (possibly negative) water delta directly against DailyStats, clamped
// at zero. Used for internal, structural water adjustments (the workout-water
// checklist credit, and Extra Today "Water" entries) - separate from the
// dailyStatsController's public waterDeltaMl, which only accepts positive deltas.
async function applyWaterDelta(dateKey, deltaMl) {
  if (!deltaMl) {
    return
  }

  const current = await DailyStats.findOne({ dateKey }).lean()
  const nextWaterMl = Math.max(0, Math.round((current?.waterMl || 0) + deltaMl))

  await DailyStats.findOneAndUpdate(
    { dateKey },
    { $set: { waterMl: nextWaterMl }, $setOnInsert: { dateKey } },
    { upsert: true, runValidators: true }
  )
}

function waterCreditDelta(previousCompletedItems, nextCompletedItems) {
  const previousIds = new Set(previousCompletedItems)
  const nextIds = new Set(nextCompletedItems)
  let delta = 0

  for (const id of nextIds) {
    if (!previousIds.has(id)) {
      delta += dailyRoutineItemsById[id]?.waterCreditMl || 0
    }
  }

  for (const id of previousIds) {
    if (!nextIds.has(id)) {
      delta -= dailyRoutineItemsById[id]?.waterCreditMl || 0
    }
  }

  return delta
}

async function buildRoutineResponse(dateKey, completion) {
  const validIds = new Set(dailyRoutineItemIds)
  const completedItems = (completion?.completedItems || []).filter((id) => validIds.has(id))
  const extraItems = await ExtraLogEntry.find({ dateKey }).sort({ createdAt: 1 }).lean()

  return {
    dateKey,
    routine: dailyRoutine,
    completedItems,
    completedCount: completedItems.length,
    totalCount: dailyRoutineItemIds.length,
    completionPercent: Math.round((completedItems.length / dailyRoutineItemIds.length) * 100),
    extraItems
  }
}

export async function getRoutine(req, res, next) {
  try {
    const dateKey = req.params.date || dateKeyFromRequest(req)
    const completion = await RoutineCompletion.findOne({ dateKey }).lean()
    res.json(await buildRoutineResponse(dateKey, completion))
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
    const nextCompletedItems = [...new Set(req.body.completedItems.filter((id) => validIds.has(id)))]

    const existing = await RoutineCompletion.findOne({ dateKey }).lean()
    const previousCompletedItems = existing?.completedItems || []

    const delta = waterCreditDelta(previousCompletedItems, nextCompletedItems)

    if (delta !== 0) {
      await applyWaterDelta(dateKey, delta)
    }

    const completion = await RoutineCompletion.findOneAndUpdate(
      { dateKey },
      { $set: { completedItems: nextCompletedItems }, $setOnInsert: { dateKey } },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json(await buildRoutineResponse(dateKey, completion))
  } catch (error) {
    next(error)
  }
}

// Food/Drink extras with calories and/or protein get a linked DietEntry so they
// flow into the same totals used by the Dashboard, Progress, and History pages -
// there is no separate calorie/protein calculation for extras.
async function createLinkedDietEntry({ dateKey, category, name, quantity, mealType, calories, protein }) {
  const caloriesValue = calories || 0
  const proteinValue = protein || 0

  if (caloriesValue <= 0 && proteinValue <= 0) {
    return null
  }

  const nutrition = {
    calories: caloriesValue,
    protein: proteinValue,
    fiber: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    caffeine: 0
  }

  const entry = await DietEntry.create({
    dateKey,
    meal: mealType || 'Other',
    // Extras aren't backed by a Food catalog entry; foodSnapshot alone drives
    // display and totals (the same way catalog-based entries work after their
    // source Food is edited or removed), so a throwaway id satisfies the
    // required ref without creating (and colliding on) a catalog entry.
    food: new mongoose.Types.ObjectId(),
    foodSnapshot: {
      name,
      category,
      defaultQuantity: { amount: 1, unit: quantity || 'serving' },
      nutrition
    },
    quantity: { amount: 1, unit: quantity || 'serving' },
    nutrition
  })

  return entry._id
}

export async function addExtraItem(req, res, next) {
  try {
    const dateKey = req.body.dateKey || dateKeyFromRequest(req)
    const { category, name, quantity, mealType, duration } = req.body

    if (!CATEGORIES.has(category)) {
      return res.status(400).json({ message: 'A valid category is required' })
    }

    // Water is just an amount - it doesn't need a name/description like the other categories.
    if (category !== 'Water' && (!name || !String(name).trim())) {
      return res.status(400).json({ message: 'Name/description is required' })
    }

    const doc = { dateKey, category, name: name && String(name).trim() ? String(name).trim() : 'Water' }

    if (FOOD_DRINK_CATEGORIES.has(category)) {
      if (mealType && !MEAL_TYPES.has(mealType)) {
        return res.status(400).json({ message: 'Invalid meal type' })
      }

      doc.quantity = quantity ? String(quantity).trim() : ''
      doc.mealType = mealType || 'Other'
      doc.calories = toOptionalNonNegativeNumber(req.body.calories, 'Calories')
      doc.protein = toOptionalNonNegativeNumber(req.body.protein, 'Protein')

      const dietEntryId = await createLinkedDietEntry({
        dateKey,
        category,
        name: doc.name,
        quantity: doc.quantity,
        mealType: doc.mealType,
        calories: doc.calories,
        protein: doc.protein
      })

      if (dietEntryId) {
        doc.dietEntryId = dietEntryId
      }
    } else if (category === 'Workout') {
      doc.duration = duration ? String(duration).trim() : ''
      doc.caloriesBurned = toOptionalNonNegativeNumber(req.body.caloriesBurned, 'Calories burned')
    } else if (category === 'Water') {
      const waterMl = Number(req.body.waterMl)

      if (!Number.isFinite(waterMl) || waterMl <= 0) {
        return res.status(400).json({ message: 'Water amount in ml must be greater than zero' })
      }

      doc.waterMl = Math.round(waterMl)
      await applyWaterDelta(dateKey, doc.waterMl)
    }

    const created = await ExtraLogEntry.create(doc)
    res.status(201).json(created)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}

export async function updateExtraItem(req, res, next) {
  try {
    const existing = await ExtraLogEntry.findById(req.params.id)

    if (!existing) {
      return res.status(404).json({ message: 'Extra item not found' })
    }

    const { name, quantity, mealType, duration } = req.body

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Name/description is required' })
      }

      existing.name = String(name).trim()
    }

    if (FOOD_DRINK_CATEGORIES.has(existing.category)) {
      if (quantity !== undefined) {
        existing.quantity = String(quantity).trim()
      }

      if (mealType !== undefined) {
        if (!MEAL_TYPES.has(mealType)) {
          return res.status(400).json({ message: 'Invalid meal type' })
        }

        existing.mealType = mealType
      }

      if (req.body.calories !== undefined) {
        existing.calories = toOptionalNonNegativeNumber(req.body.calories, 'Calories')
      }

      if (req.body.protein !== undefined) {
        existing.protein = toOptionalNonNegativeNumber(req.body.protein, 'Protein')
      }

      // Simplest way to keep the linked DietEntry in sync with any of the
      // fields above: replace it rather than patch it in place.
      if (existing.dietEntryId) {
        await DietEntry.findByIdAndDelete(existing.dietEntryId)
        existing.dietEntryId = undefined
      }

      const dietEntryId = await createLinkedDietEntry({
        dateKey: existing.dateKey,
        category: existing.category,
        name: existing.name,
        quantity: existing.quantity,
        mealType: existing.mealType,
        calories: existing.calories,
        protein: existing.protein
      })

      if (dietEntryId) {
        existing.dietEntryId = dietEntryId
      }
    } else if (existing.category === 'Workout') {
      if (duration !== undefined) {
        existing.duration = String(duration).trim()
      }

      if (req.body.caloriesBurned !== undefined) {
        existing.caloriesBurned = toOptionalNonNegativeNumber(req.body.caloriesBurned, 'Calories burned')
      }
    } else if (existing.category === 'Water' && req.body.waterMl !== undefined) {
      const waterMl = Number(req.body.waterMl)

      if (!Number.isFinite(waterMl) || waterMl <= 0) {
        return res.status(400).json({ message: 'Water amount in ml must be greater than zero' })
      }

      const roundedWaterMl = Math.round(waterMl)
      await applyWaterDelta(existing.dateKey, roundedWaterMl - existing.waterMl)
      existing.waterMl = roundedWaterMl
    }

    await existing.save()
    res.json(existing)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message })
    }

    next(error)
  }
}

export async function deleteExtraItem(req, res, next) {
  try {
    const existing = await ExtraLogEntry.findByIdAndDelete(req.params.id)

    if (!existing) {
      return res.status(404).json({ message: 'Extra item not found' })
    }

    if (existing.dietEntryId) {
      await DietEntry.findByIdAndDelete(existing.dietEntryId)
    }

    if (existing.category === 'Water' && existing.waterMl) {
      await applyWaterDelta(existing.dateKey, -existing.waterMl)
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
