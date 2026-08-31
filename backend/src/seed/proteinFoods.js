import Food from '../models/Food.js'

const proteinFoods = [
  ['Chicken Breast', 100, 'g', 165, 31, 0, 0, 3.6, 0, 0, 'Editable starter value.'],
  ['Whole Egg', 1, 'egg', 70, 6, 0, 0.4, 4.8, 0, 0, 'Editable starter value.'],
  ['Egg Whites', 2, 'egg whites', 34, 7, 0, 0.5, 0.1, 0, 0, 'Editable starter value.'],
  ['Nakpro Protein', 1, 'serving', 0, 0, 0, 0, 0, 0, 0, 'Enter label values from your package. Editable starter value.'],
  ['Mixed Seeds', 10, 'g', 55, 2, 1.5, 0, 0, 0, 0, 'Editable starter value.'],
  ['Soaked Almonds', 5, 'almonds', 36, 1.3, 0.8, 1.3, 3, 0, 0, 'Editable starter value.'],
  ['Pumpkin Seeds', 1, 'tbsp', 43, 2, 0.5, 1.4, 3.7, 0, 0, 'Editable starter value.'],
  ['Flax Seeds', 1, 'tbsp', 55, 1.9, 2.8, 3, 4.3, 0, 0, 'Editable starter value.'],
  ['Herbalife Afresh', 1, 'serving', 4, 0, 0, 0, 0, 0, 40, 'Herbalife Afresh mixed with water. Editable starter value.'],
  ['Herbalife Protein Shake', 1, 'serving', 90, 15, 0, 2, 1, 0, 0, 'Herbalife personalized protein powder mixed with water. Editable starter value.']
]

export async function seedProteinFoods() {
  for (const [name, amount, unit, calories, protein, fiber, carbs, fat, sugar, caffeine, notes] of proteinFoods) {
    const existingFood = await Food.findOne({ name })

    if (existingFood) {
      if (!existingFood.nutrition.carbs && !existingFood.nutrition.fat) {
        await Food.updateOne(
          { _id: existingFood._id },
          { $set: { 'nutrition.carbs': carbs, 'nutrition.fat': fat } }
        )
      }

      continue
    }

    await Food.create({
      name,
      category: 'Protein',
      defaultQuantity: { amount, unit },
      nutrition: { calories, protein, fiber, carbs, fat, sugar, caffeine },
      notes
    })
  }
}
