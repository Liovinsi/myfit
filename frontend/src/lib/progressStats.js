const STEPS_TARGET = 5000
const WATER_TARGET_ML = 4000
const PROTEIN_TARGET = 70
const CALORIE_TARGET = 1300

function percentOfDaysMeeting(days, predicate) {
  if (days.length === 0) {
    return null
  }

  const qualifying = days.filter(predicate).length
  return Math.round((qualifying / days.length) * 100)
}

export function computeOverallScore(days, latestWeightKg, targetWeightKg, weightHistory) {
  const scores = []
  const metrics = []

  const stepsScore = percentOfDaysMeeting(days, (day) => day.steps >= STEPS_TARGET)
  if (stepsScore != null) {
    scores.push(stepsScore)
    metrics.push('daily step goal')
  }

  const waterScore = percentOfDaysMeeting(days, (day) => day.waterMl >= WATER_TARGET_ML)
  if (waterScore != null) {
    scores.push(waterScore)
    metrics.push('daily water goal')
  }

  const proteinScore = percentOfDaysMeeting(days, (day) => day.protein >= PROTEIN_TARGET)
  if (proteinScore != null) {
    scores.push(proteinScore)
    metrics.push('daily protein goal')
  }

  const daysWithCalories = days.filter((day) => day.calories > 0)
  const calorieScore = daysWithCalories.length > 0
    ? Math.round(
        (daysWithCalories.filter((day) => day.calories <= CALORIE_TARGET).length / daysWithCalories.length) * 100
      )
    : null
  if (calorieScore != null) {
    scores.push(calorieScore)
    metrics.push('calorie budget')
  }

  const scheduledWorkoutDays = days.filter((day) => !day.restDay)
  const workoutScore = scheduledWorkoutDays.length > 0
    ? Math.round(
        (scheduledWorkoutDays.filter((day) => day.workoutCompleted).length / scheduledWorkoutDays.length) * 100
      )
    : null
  if (workoutScore != null) {
    scores.push(workoutScore)
    metrics.push('workout completion')
  }

  if (latestWeightKg != null && targetWeightKg != null && weightHistory.length > 0) {
    const startingWeightKg = weightHistory[weightHistory.length - 1].weightKg
    const totalToChange = targetWeightKg - startingWeightKg
    const weightScore = totalToChange === 0
      ? 100
      : Math.min(100, Math.max(0, Math.round(((latestWeightKg - startingWeightKg) / totalToChange) * 100)))
    scores.push(weightScore)
    metrics.push('weight goal progress')
  }

  if (scores.length === 0) {
    return { score: null, metrics: [] }
  }

  return {
    score: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
    metrics
  }
}

export function computeBestStats(days, weightHistory) {
  const stats = []

  const bestSteps = days.reduce((best, day) => (day.steps > (best?.steps || 0) ? day : best), null)
  if (bestSteps && bestSteps.steps > 0) {
    stats.push({ label: 'Best Step Day', value: `${bestSteps.steps} steps`, detail: bestSteps.dateKey })
  }

  const bestProtein = days.reduce((best, day) => (day.protein > (best?.protein || 0) ? day : best), null)
  if (bestProtein && bestProtein.protein > 0) {
    stats.push({ label: 'Best Protein Day', value: `${bestProtein.protein} g`, detail: bestProtein.dateKey })
  }

  const bestWater = days.reduce((best, day) => (day.waterMl > (best?.waterMl || 0) ? day : best), null)
  if (bestWater && bestWater.waterMl > 0) {
    stats.push({
      label: 'Best Water Day',
      value: `${(bestWater.waterMl / 1000).toFixed(1)} L`,
      detail: bestWater.dateKey
    })
  }

  let bestStreak = 0
  let currentStreak = 0
  let bestStreakEnd = null

  days.forEach((day) => {
    if (day.restDay) {
      return
    }

    if (day.workoutCompleted) {
      currentStreak += 1

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak
        bestStreakEnd = day.dateKey
      }
    } else {
      currentStreak = 0
    }
  })

  if (bestStreak > 0) {
    stats.push({
      label: 'Most Consistent Workout Streak',
      value: `${bestStreak} workout${bestStreak === 1 ? '' : 's'} in a row`,
      detail: `ending ${bestStreakEnd}`
    })
  }

  if (weightHistory.length >= 2) {
    const chronological = [...weightHistory].reverse()
    let biggestDrop = 0
    let dropRange = null

    for (let i = 1; i < chronological.length; i += 1) {
      const drop = chronological[i - 1].weightKg - chronological[i].weightKg

      if (drop > biggestDrop) {
        biggestDrop = drop
        dropRange = `${chronological[i - 1].dateKey} → ${chronological[i].dateKey}`
      }
    }

    if (biggestDrop > 0) {
      stats.push({
        label: 'Highest Weight-Loss Progress',
        value: `-${biggestDrop.toFixed(1)} kg`,
        detail: dropRange
      })
    }
  }

  return stats
}
