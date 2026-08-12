import Food from '../models/Food.js'

const regularFoods = [
  ['Chapathi', 'Meal', 2, 'medium', 200, 6, 5, 'Editable starter value.'],
  ['Medium Dosa', 'Breakfast', 2, 'pieces', 260, 6, 2, 'Editable starter value.'],
  ['Kothumai Rava Kichadi', 'Breakfast', 60, 'g', 210, 6, 4, 'Editable starter value.'],
  ['Oats', 'Breakfast', 60, 'g', 230, 10, 6, 'Editable starter value.'],
  ['Ragi Semiya', 'Breakfast', 60, 'g', 210, 5, 4, 'Editable starter value.'],
  ['White Rice', 'Meal', 30, 'g cooked', 39, 0.8, 0.1, 'Editable starter value.'],
  ['Curd', 'Meal', 100, 'g', 60, 3.5, 0, 'Editable starter value.'],
  ['Rasam', 'Meal', 100, 'ml', 30, 1, 1, 'Editable starter value.'],
  ['Poriyal', 'Meal', 100, 'g', 100, 2.5, 3.5, 'Editable starter value.'],
  ['Sathukudi Juice', 'Drink', 200, 'ml', 80, 1, 0.5, 'No sugar, no milk. Editable starter value.'],
  ['Madhulai Juice', 'Drink', 200, 'ml', 105, 1.5, 1, 'No sugar, no milk. Editable starter value.'],
  ['Tea', 'Drink', 1, 'cup', 30, 1.5, 0, 'No sugar. Editable starter value.'],
  ['Paneer', 'Protein', 30, 'g', 80, 5.4, 0, 'Editable starter value.'],
  ['Soya Chunks', 'Protein', 40, 'g', 140, 21, 6.5, 'Editable starter value.']
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

  for (const [name, category, amount, unit, calories, protein, fiber, notes] of regularFoods) {
    const food = await Food.findOne({ name })
    const payload = {
      name,
      category,
      defaultQuantity: { amount, unit },
      nutrition: { calories, protein, fiber },
      notes
    }

    if (!food) {
      await Food.create(payload)
      continue
    }

    if (food.notes === 'Editable starter value.' || !food.notes) {
      await Food.updateOne({ _id: food._id }, { $set: payload })
    }
  }
}
