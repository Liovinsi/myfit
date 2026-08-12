const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
  } catch {
    throw new Error(`Cannot reach MyFit backend at ${API_BASE_URL}`)
  }

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const body = await response.json()
      message = body.message || message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const api = {
  getFoods: () => request('/fooditems'),
  getProteins: () => request('/proteins'),
  createProtein: (protein) =>
    request('/proteins', {
      method: 'POST',
      body: JSON.stringify(protein)
    }),
  updateProtein: (id, protein) =>
    request(`/proteins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(protein)
    }),
  deleteProtein: (id) =>
    request(`/proteins/${id}`, {
      method: 'DELETE'
    }),
  createFood: (food) =>
    request('/fooditems', {
      method: 'POST',
      body: JSON.stringify(food)
    }),
  updateFood: (id, food) =>
    request(`/fooditems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(food)
    }),
  deleteFood: (id) =>
    request(`/fooditems/${id}`, {
      method: 'DELETE'
    }),
  getTodayDiet: (dateKey = getTodayKey()) => request(`/foodlogs/${dateKey}`),
  addTodayFoods: ({ dateKey = getTodayKey(), meal, foodIds }) =>
    request('/foodlogs', {
      method: 'POST',
      body: JSON.stringify({ dateKey, meal, foodIds })
    }),
  updateDietQuantity: (id, quantityAmount) =>
    request(`/foodlogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantityAmount })
    }),
  removeDietEntry: (id) =>
    request(`/foodlogs/${id}`, {
      method: 'DELETE'
    }),
  getWorkouts: () => request('/workouts'),
  getWorkout: (day) => request(`/workouts/${day}`),
  getTodayWorkout: (dateKey = getTodayKey()) => request(`/workouts/today?date=${dateKey}`),
  getWorkoutCompletion: (dateKey = getTodayKey()) => request(`/workouts/completion/${dateKey}`),
  completeWorkout: ({ dateKey = getTodayKey(), day }) =>
    request('/workouts/complete', {
      method: 'POST',
      body: JSON.stringify({ dateKey, day })
    }),
  saveWorkoutProgress: ({ dateKey = getTodayKey(), completedExercises, cardioCompleted }) =>
    request('/workouts/progress', {
      method: 'PATCH',
      body: JSON.stringify({ dateKey, completedExercises, cardioCompleted })
    }),
  getDailyStats: (dateKey = getTodayKey()) => request(`/dailystats/${dateKey}`),
  saveDailyStats: ({ dateKey = getTodayKey(), steps, waterMl, waterDeltaMl }) =>
    request('/dailystats', {
      method: 'POST',
      body: JSON.stringify({ dateKey, steps, waterMl, waterDeltaMl })
    }),
  getWeightEntry: (dateKey = getTodayKey()) => request(`/weights/${dateKey}`),
  getLatestWeight: () => request('/weights/latest'),
  getWeightHistory: (limit = 30) => request(`/weights/history?limit=${limit}`),
  saveWeight: ({ dateKey = getTodayKey(), weightKg }) =>
    request('/weights', {
      method: 'POST',
      body: JSON.stringify({ dateKey, weightKg })
    }),
  getWeightGoal: () => request('/weights/goal'),
  saveWeightGoal: (targetWeightKg) =>
    request('/weights/goal', {
      method: 'PUT',
      body: JSON.stringify({ targetWeightKg })
    }),
  getTodayChallenges: (dateKey = getTodayKey()) => request(`/challenges/today?date=${dateKey}`),
  getWeeklyChallenges: (dateKey = getTodayKey()) => request(`/challenges/weekly?date=${dateKey}`),
  getProgressHistory: (range = '7d') => request(`/progress/history?range=${range}`),
  getRewards: () => request('/rewards'),
  getRewardsForDate: (dateKey = getTodayKey()) => request(`/rewards/${dateKey}`)
}
