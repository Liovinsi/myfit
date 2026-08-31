import Food from '../models/Food.js'

const proteinCategory = 'Protein'

function proteinPayload(body) {
  return {
    name: body.name,
    category: proteinCategory,
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

export async function getProteins(_req, res, next) {
  try {
    const proteins = await Food.find({ category: proteinCategory }).sort({ createdAt: 1, name: 1 })
    res.json(proteins)
  } catch (error) {
    next(error)
  }
}

export async function createProtein(req, res, next) {
  try {
    const protein = await Food.create(proteinPayload(req.body))
    res.status(201).json(protein)
  } catch (error) {
    next(error)
  }
}

export async function updateProtein(req, res, next) {
  try {
    const protein = await Food.findOneAndUpdate(
      { _id: req.params.id, category: proteinCategory },
      proteinPayload(req.body),
      {
        new: true,
        runValidators: true
      }
    )

    if (!protein) {
      return res.status(404).json({ message: 'Protein food not found' })
    }

    res.json(protein)
  } catch (error) {
    next(error)
  }
}

export async function deleteProtein(req, res, next) {
  try {
    const protein = await Food.findOneAndDelete({ _id: req.params.id, category: proteinCategory })

    if (!protein) {
      return res.status(404).json({ message: 'Protein food not found' })
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
