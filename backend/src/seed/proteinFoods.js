import Food from '../models/Food.js'

const proteinFoods = [
  ['Chicken Breast', 100, 'g', 165, 31, 0, 'Editable starter value.'],
  ['Whole Egg', 1, 'egg', 70, 6, 0, 'Editable starter value.'],
  ['Egg Whites', 2, 'egg whites', 34, 7, 0, 'Editable starter value.'],
  ['Nakpro Protein', 1, 'serving', 0, 0, 0, 'Enter label values from your package. Editable starter value.'],
  ['Mixed Seeds', 10, 'g', 55, 2, 1.5, 'Editable starter value.']
]

export async function seedProteinFoods() {
  for (const [name, amount, unit, calories, protein, fiber, notes] of proteinFoods) {
    const existingFood = await Food.findOne({ name })

    if (existingFood) {
      continue
    }

    await Food.create({
      name,
      category: 'Protein',
      defaultQuantity: { amount, unit },
      nutrition: { calories, protein, fiber },
      notes
    })
  }
}
