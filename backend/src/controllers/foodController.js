import Food from '../models/Food.js'

function foodPayload(body) {
  return {
    name: body.name,
    category: body.category || 'General',
    defaultQuantity: {
      amount: Number(body.defaultQuantity?.amount),
      unit: body.defaultQuantity?.unit
    },
    nutrition: {
      calories: Number(body.nutrition?.calories),
      protein: Number(body.nutrition?.protein),
      fiber: Number(body.nutrition?.fiber),
      carbs: Number(body.nutrition?.carbs) || 0,
      fat: Number(body.nutrition?.fat) || 0,
      sugar: Number(body.nutrition?.sugar) || 0,
      caffeine: Number(body.nutrition?.caffeine) || 0
    },
    notes: body.notes || ''
  }
}

export async function getFoods(_req, res, next) {
  try {
    const foods = await Food.find().sort({ createdAt: 1, name: 1 })
    res.json(foods)
  } catch (error) {
    next(error)
  }
}

export async function createFood(req, res, next) {
  try {
    const food = await Food.create(foodPayload(req.body))
    res.status(201).json(food)
  } catch (error) {
    next(error)
  }
}

export async function updateFood(req, res, next) {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, foodPayload(req.body), {
      new: true,
      runValidators: true
    })

    if (!food) {
      return res.status(404).json({ message: 'Food not found' })
    }

    res.json(food)
  } catch (error) {
    next(error)
  }
}

export async function deleteFood(req, res, next) {
  try {
    const food = await Food.findByIdAndDelete(req.params.id)

    if (!food) {
      return res.status(404).json({ message: 'Food not found' })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
