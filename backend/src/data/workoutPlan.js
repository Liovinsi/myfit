export const workoutPlan = [
  {
    day: 'Monday',
    workoutName: 'Legs',
    cardioDuration: 30,
    estimatedBurn: '~400–620 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Leg Press', sets: 3, reps: '15' },
      { name: 'Lunges', sets: 3, reps: '12 each steps' },
      { name: 'Goblet Squat', sets: 3, reps: '15' },
      { name: 'Leg Extension', sets: 3, reps: '20' },
      { name: 'Standing Calf Raise', sets: 3, reps: '15-20' }
    ]
  },
  {
    day: 'Tuesday',
    workoutName: 'Back + Biceps',
    cardioDuration: 30,
    estimatedBurn: '~350–550 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Lat Pulldown', sets: 3, reps: '12-15' },
      { name: 'Seated Machine Row', sets: 3, reps: '12-15' },
      { name: 'Straight Arm Pulldown', sets: 3, reps: '15-20' },
      { name: 'Rope Hammer Curl', sets: 3, reps: '15' },
      { name: 'DB Curl', sets: 3, reps: '15' }
    ]
  },
  {
    day: 'Wednesday',
    workoutName: 'Chest + Triceps',
    cardioDuration: 30,
    estimatedBurn: '~350–550 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Incline Dumbbell Press', sets: 3, reps: '12-15' },
      { name: 'Flat DB Press', sets: 3, reps: '12-15' },
      { name: 'Pec Deck', sets: 3, reps: '15' },
      { name: 'Rope Pushdown', sets: 3, reps: '15' },
      { name: 'Overhead Rope Extension', sets: 3, reps: '15' }
    ]
  },
  {
    day: 'Thursday',
    workoutName: 'Hamstring + Glutes',
    cardioDuration: 30,
    estimatedBurn: '~400–600 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Romanian Deadlift', sets: 3, reps: '12' },
      { name: 'Glute Bridge', sets: 3, reps: '15' },
      { name: 'Seated Leg Curl', sets: 3, reps: '20' },
      { name: 'Step-ups', sets: 3, reps: '15 each leg' },
      { name: 'Calf Raise', sets: 4, reps: '20' }
    ]
  },
  {
    day: 'Friday',
    workoutName: 'Shoulders',
    cardioDuration: 30,
    estimatedBurn: '~320–500 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '15' },
      { name: 'Lateral Raise', sets: 3, reps: '20' },
      { name: 'Front Raise', sets: 3, reps: '15' },
      { name: 'Rear Delt Fly', sets: 3, reps: '20' }
    ]
  },
  {
    day: 'Saturday',
    workoutName: 'Arms',
    cardioDuration: 30,
    estimatedBurn: '~320–500 kcal',
    estimateBasis: 'Body weight: 76 kg',
    exercises: [
      { name: 'Incline Curl', sets: 3, reps: '10-12' },
      { name: 'Preacher Curl', sets: 3, reps: '10-12' },
      { name: 'Cable Curl', sets: 3, reps: '15' },
      { name: 'Close Grip Bench Press', sets: 3, reps: '10-12' },
      { name: 'Cable Pushdown', sets: 3, reps: '10-12' },
      { name: 'One Arm Extension', sets: 3, reps: '15' }
    ]
  },
  {
    day: 'Sunday',
    workoutName: 'Rest Day',
    cardioDuration: 0,
    estimatedBurn: null,
    estimateBasis: null,
    exercises: []
  }
]

export const workoutDays = workoutPlan.map((workout) => workout.day)

export function normalizeWorkoutDay(day) {
  const normalized = String(day || '').trim().toLowerCase()
  return workoutDays.find((workoutDay) => workoutDay.toLowerCase() === normalized)
}

export function getWorkoutByDay(day) {
  const normalizedDay = normalizeWorkoutDay(day)
  return workoutPlan.find((workout) => workout.day === normalizedDay) || null
}
