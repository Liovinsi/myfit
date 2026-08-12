export const DAILY_CHALLENGES = [
  {
    id: 'daily-workout',
    name: "Complete Today's Workout",
    description: 'Finish your scheduled resistance workout for the day.',
    category: 'Fitness',
    unit: 'workout',
    target: 1,
    coinReward: 20
  },
  {
    id: 'daily-steps',
    name: 'Reach 5,000 Steps',
    description: 'Log at least 5,000 steps today.',
    category: 'Activity',
    unit: 'steps',
    target: 5000,
    coinReward: 15
  },
  {
    id: 'daily-water',
    name: 'Drink 4L Water',
    description: 'Log at least 4,000 ml of water today.',
    category: 'Hydration',
    unit: 'ml',
    target: 4000,
    coinReward: 10
  },
  {
    id: 'daily-protein',
    name: 'Reach 70g Protein',
    description: 'Log at least 70g of protein in your diet today.',
    category: 'Nutrition',
    unit: 'g',
    target: 70,
    coinReward: 15
  },
  {
    id: 'daily-calories',
    name: 'Stay Within 1,300 kcal',
    description: 'Keep your logged calories at or under 1,300 kcal today.',
    category: 'Nutrition',
    unit: 'kcal',
    target: 1300,
    coinReward: 15
  }
]

export const WEEKLY_CHALLENGES = [
  {
    id: 'weekly-workout',
    name: 'Complete Workouts Monday–Saturday',
    description: 'Complete all 6 scheduled workouts this week.',
    category: 'Fitness',
    unit: 'days',
    target: 6,
    coinReward: 60
  },
  {
    id: 'weekly-steps',
    name: 'Reach 5K Steps on Multiple Days',
    description: 'Hit 5,000+ steps on at least 3 days this week.',
    category: 'Activity',
    unit: 'days',
    target: 3,
    coinReward: 40
  },
  {
    id: 'weekly-protein',
    name: 'Maintain Protein Target',
    description: 'Reach 70g+ protein on at least 5 days this week.',
    category: 'Nutrition',
    unit: 'days',
    target: 5,
    coinReward: 40
  },
  {
    id: 'weekly-water',
    name: 'Maintain Water Target',
    description: 'Reach 4L+ water on at least 5 days this week.',
    category: 'Hydration',
    unit: 'days',
    target: 5,
    coinReward: 30
  }
]
