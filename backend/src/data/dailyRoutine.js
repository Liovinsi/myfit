export const dailyRoutine = {
  wakeUpTime: '05:30 AM',
  sections: [
    {
      id: 'pre-workout',
      title: 'Pre Workout',
      items: [{ id: 'leanbody-tablets', label: 'Leanbody tablet x2 with water' }]
    },
    {
      id: 'post-workout',
      title: 'Post Workout',
      items: [
        { id: 'madhulai-juice', label: 'Madhulai Juice (No Sugar)' },
        { id: 'rolled-oats', label: '70g Rolled Oats' },
        { id: 'full-egg', label: '1 Full Egg' }
      ]
    },
    {
      id: '11am',
      title: '11 AM',
      items: [
        { id: 'sathukudi-juice', label: 'Sathukudi Juice' },
        { id: 'chia-seeds', label: 'Chia Seeds' },
        { id: 'sabja-seeds', label: 'Sabja Seeds' }
      ]
    },
    {
      id: 'lunch',
      title: 'Lunch',
      items: [
        { id: 'chicken', label: '120g Chicken (No Oil)' },
        { id: 'chapathi-rice', label: 'Chapathi or Rice' },
        { id: 'egg-white', label: 'Egg White' }
      ]
    },
    {
      id: 'alternate-days',
      title: 'Alternate Days',
      items: [{ id: 'nakpro-shake', label: 'Nakpro Protein Shake' }]
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
