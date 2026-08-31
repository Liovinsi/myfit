import Food from '../models/Food.js'

const regularFoods = [
  ['Chapathi', 'Meal', 2, 'medium', 200, 6, 5, 36, 5, 'Editable starter value.'],
  ['Medium Dosa', 'Breakfast', 2, 'pieces', 260, 6, 2, 0, 0, 'Editable starter value.'],
  ['Kothumai Rava Kichadi', 'Breakfast', 60, 'g', 210, 6, 4, 0, 0, 'Editable starter value.'],
  ['Oats', 'Breakfast', 60, 'g', 230, 10, 6, 0, 0, 'Editable starter value.'],
  ['Ragi Semiya', 'Breakfast', 60, 'g', 210, 5, 4, 0, 0, 'Editable starter value.'],
  ['White Rice', 'Meal', 30, 'g cooked', 39, 0.8, 0.1, 0, 0, 'Editable starter value.'],
  ['Curd', 'Meal', 100, 'g', 60, 3.5, 0, 0, 0, 'Editable starter value.'],
  ['Rasam', 'Meal', 100, 'ml', 30, 1, 1, 0, 0, 'Editable starter value.'],
  ['Poriyal', 'Meal', 100, 'g', 100, 2.5, 3.5, 0, 0, 'Editable starter value.'],
  ['Sathukudi Juice', 'Drink', 200, 'ml', 80, 1, 0.5, 0, 0, 'No sugar, no milk. Editable starter value.'],
  ['Madhulai Juice', 'Drink', 200, 'ml', 105, 1.5, 1, 0, 0, 'No sugar, no milk. Editable starter value.'],
  ['Tea', 'Drink', 1, 'cup', 30, 1.5, 0, 0, 0, 'No sugar. Editable starter value.'],
  ['Paneer', 'Protein', 30, 'g', 80, 5.4, 0, 0, 0, 'Editable starter value.'],
  ['Soya Chunks', 'Protein', 40, 'g', 140, 21, 6.5, 0, 0, 'Editable starter value.'],
  ['Morning Shake', 'Breakfast', 1, 'serving', 223, 25, 0, 0, 0, 'Herbalife Formula 1 + ShakeMate + Personalized Protein Powder mixed with 300 ml water. Editable starter value.'],
  ['Seeds', 'Breakfast', 1, 'tbsp', 57, 2.9, 1.9, 0, 0, 'Mixed pumpkin + flax seeds, total 1 tbsp. Editable starter value.'],
  ['Madhulai / Pomegranate Juice', 'Drink', 300, 'ml', 162, 0.4, 0.2, 0, 0, 'Pomegranate juice + water. No sugar, no milk. Editable starter value.'],
  ['Ragi Chapathi', 'Dinner', 2, 'pieces', 200, 6, 6, 40, 2, 'Editable starter value.'],
  ['Apple', 'Meal', 1, 'medium', 95, 0.5, 4.4, 25, 0.3, 'Editable starter value.'],
  ['Guava', 'Meal', 1, 'medium', 68, 2.6, 5.4, 14.3, 1, 'Editable starter value.'],
  ['Papaya', 'Meal', 150, 'g', 65, 0.75, 2.6, 16.5, 0.45, 'Editable starter value.'],
  ['Egg with Onion & Carrot', 'Dinner', 1, 'egg', 96, 6.9, 1.3, 6.1, 4.9, '1 whole egg with onion and carrot. Editable starter value.']
]

export async function seedRegularFoods() {
  const oldStarterNames = [
    'Dosa',
    'Rice',
    'Dal',
    'Idli',
    'Upma',
    'Vegetable Sabzi',
    'Egg',
    'Milk'
  ]

  await Food.deleteMany({
    name: { $in: oldStarterNames },
    notes: 'Editable starter value.'
  })

  for (const [name, category, amount, unit, calories, protein, fiber, carbs, fat, notes] of regularFoods) {
    const food = await Food.findOne({ name })
    const payload = {
      name,
      category,
      defaultQuantity: { amount, unit },
      nutrition: { calories, protein, fiber, carbs, fat },
      notes
    }

    if (!food) {
      await Food.create(payload)
      continue
    }

    if (food.notes === 'Editable starter value.' || !food.notes) {
      await Food.updateOne({ _id: food._id }, { $set: payload })
    } else if (food.nutrition.carbs === undefined || food.nutrition.fat === undefined) {
      await Food.updateOne(
        { _id: food._id },
        { $set: { 'nutrition.carbs': food.nutrition.carbs ?? 0, 'nutrition.fat': food.nutrition.fat ?? 0 } }
      )
    }
  }
}
