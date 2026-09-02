import DietEntry from '../models/DietEntry.js'
import Food from '../models/Food.js'
import { calculateNutrition, dateKeyFromRequest, todayDateKey } from '../utils/nutrition.js'

// 'Snack' and 'Other' aren't offered when logging from the food catalog (see
// MealSelector.jsx), but Extra Today items (routineController.js) can create
// DietEntry documents tagged with them, so summarize() must group them too.
const meals = ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner', 'Snack', 'Other']

function summarize(entries) {
  const groupedMeals = Object.fromEntries(meals.map((meal) => [meal, []]))
  const totals = { calories: 0, protein: 0, fiber: 0, carbs: 0, fat: 0, sugar: 0, caffeine: 0 }

  entries.forEach((entry) => {
    groupedMeals[entry.meal].push(entry)
    totals.calories += entry.nutrition.calories
    totals.protein += entry.nutrition.protein
    totals.fiber += entry.nutrition.fiber
    totals.carbs += entry.nutrition.carbs || 0
    totals.fat += entry.nutrition.fat || 0
    totals.sugar += entry.nutrition.sugar || 0
    totals.caffeine += entry.nutrition.caffeine || 0
  })

  return {
    entries,
    meals: groupedMeals,
    totals: {
      calories: Math.round(totals.calories * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      caffeine: Math.round(totals.caffeine * 10) / 10
    }
  }
}

export async function getTodayDiet(req, res, next) {
  try {
    const dateKey = req.params.date || dateKeyFromRequest(req)
    const entries = await DietEntry.find({ dateKey }).sort({ createdAt: 1 }).lean()
    res.json(summarize(entries))
  } catch (error) {
    next(error)
  }
}

export async function addSelectedFoods(req, res, next) {
  try {
    const dateKey = req.body.dateKey || dateKeyFromRequest(req) || todayDateKey()
    const { meal, foodIds } = req.body

    if (!meals.includes(meal) || !Array.isArray(foodIds) || foodIds.length === 0) {
      return res.status(400).json({ message: 'Meal and selected foods are required' })
    }

    const foods = await Food.find({ _id: { $in: foodIds } })
    const created = []
    const skipped = []

    for (const food of foods) {
      const existing = await DietEntry.findOne({ dateKey, meal, food: food._id })

      if (existing) {
        skipped.push(food._id.toString())
        continue
      }

      const quantity = {
        amount: food.defaultQuantity.amount,
        unit: food.defaultQuantity.unit
      }

      created.push(
        await DietEntry.create({
          dateKey,
          meal,
          food: food._id,
          foodSnapshot: {
            name: food.name,
            category: food.category,
            defaultQuantity: food.defaultQuantity,
            nutrition: food.nutrition
          },
          quantity,
          nutrition: calculateNutrition(food, quantity.amount)
        })
      )
    }

    const entries = await DietEntry.find({ dateKey }).sort({ createdAt: 1 }).lean()
    res.status(201).json({ ...summarize(entries), createdCount: created.length, skipped })
  } catch (error) {
    next(error)
  }
}

export async function updateDietQuantity(req, res, next) {
  try {
    const entry = await DietEntry.findById(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: 'Diet entry not found' })
    }

    const quantityAmount = Number(req.body.quantityAmount)

    if (!Number.isFinite(quantityAmount) || quantityAmount <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' })
    }

    entry.quantity.amount = quantityAmount
    entry.nutrition = calculateNutrition(entry.foodSnapshot, quantityAmount)
    await entry.save()

    res.json(entry)
  } catch (error) {
    next(error)
  }
}

export async function removeDietEntry(req, res, next) {
  try {
    const entry = await DietEntry.findByIdAndDelete(req.params.id)

    if (!entry) {
      return res.status(404).json({ message: 'Diet entry not found' })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
