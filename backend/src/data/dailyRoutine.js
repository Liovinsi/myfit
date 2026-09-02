export const dailyRoutine = {
  wakeUpTime: '05:30 AM',
  sections: [
    {
      id: 'pre-workout',
      title: 'Morning / Pre Workout',
      items: [
        { id: 'pre-workout-warmup', label: 'Pre-workout – 15 min' },
        { id: 'gym-weight-training', label: 'Gym – Weight Training' },
        { id: 'treadmill-walking', label: 'Treadmill Walking – 30 min' },
        // Checking this credits 1000 ml to today's water total (see routineController's
        // water-credit logic) so it isn't left out of the day's water tracking, and
        // unchecking reverses the same amount so it's never double counted.
        { id: 'workout-water', label: 'Water – approx. 1 L around workout', waterCreditMl: 1000 },
        { id: 'madhulai-juice', label: 'Madhulai Juice' },
        { id: 'herbalife-shake', label: 'Fresh Herbalife Shake' },
        { id: 'almonds', label: '5 Almonds' },
        { id: 'flax-seeds', label: 'Flax Seeds – 1 small spoon' },
        { id: 'pumpkin-seeds', label: 'Pumpkin Seeds – 1 small spoon' }
      ]
    },
    {
      id: 'lunch',
      title: 'Lunch',
      items: [
        { id: 'chicken', label: 'Chicken' },
        { id: 'chapathi-rice', label: 'Chapathi or Rice' },
        { id: 'egg-white-2', label: '2 Egg Whites' },
        { id: 'full-egg', label: '1 Full Egg' }
      ]
    },
    {
      id: 'dinner',
      title: 'Dinner',
      items: [
        { id: 'soya-paneer', label: '30g Soya or Paneer' },
        { id: 'wheat-dosa', label: 'Wheat Dosa' },
        { id: 'oats-dosa', label: 'Oats Dosa' },
        { id: 'idli', label: 'Idli' }
      ]
    }
  ],
  waterTargetLitres: 3
}

export const dailyRoutineItemIds = dailyRoutine.sections.flatMap((section) =>
  section.items.map((item) => item.id)
)

export const dailyRoutineItemsById = Object.fromEntries(
  dailyRoutine.sections.flatMap((section) => section.items.map((item) => [item.id, item]))
)
