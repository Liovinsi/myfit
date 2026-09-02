if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error(
    'VITE_API_URL is not set. Set it in the deployment environment (e.g. Vercel project settings) to the backend API URL, such as https://vidyafit.onrender.com/api.'
  )
}

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
  } catch (networkError) {
    console.error(`Request to ${API_BASE_URL}${path} failed:`, networkError)
    throw new Error(
      `Cannot reach MyFit backend at ${API_BASE_URL} (${networkError.message}). It may be a CORS or network issue.`
    )
  }

  if (!response.ok) {
    let message = response.statusText || 'Request failed'

    try {
      const body = await response.json()
      message = body.message || message
    } catch {
      // Response body wasn't JSON; fall back to statusText already set above.
    }

    throw new Error(`${response.status} ${message}`)
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
  saveDailyStats: ({ dateKey = getTodayKey(), steps, waterMl, waterDeltaMl, caloriesBurned, afreshCount, afreshCountDelta }) =>
    request('/dailystats', {
      method: 'POST',
      body: JSON.stringify({ dateKey, steps, waterMl, waterDeltaMl, caloriesBurned, afreshCount, afreshCountDelta })
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
  getRewardsForDate: (dateKey = getTodayKey()) => request(`/rewards/${dateKey}`),
  getSuggestedCaloriesBurned: (dateKey = getTodayKey()) =>
    request(`/dailystats/suggested-burn/${dateKey}`),

  getRoutine: (dateKey = getTodayKey()) => request(`/routine/${dateKey}`),
  saveRoutineProgress: ({ dateKey = getTodayKey(), completedItems }) =>
    request('/routine', {
      method: 'PATCH',
      body: JSON.stringify({ dateKey, completedItems })
    }),

  getChecklist: (dateKey = getTodayKey()) => request(`/checklist/${dateKey}`),
  setDietFollowed: ({ dateKey = getTodayKey(), dietFollowed }) =>
    request('/checklist', {
      method: 'PATCH',
      body: JSON.stringify({ dateKey, dietFollowed })
    }),

  getHundredDaysChallenge: () => request('/hundred-days'),
  toggleHundredDaysDay: (dayNumber) =>
    request(`/hundred-days/day/${dayNumber}`, { method: 'PATCH' }),

  getProfile: () => request('/profile'),
  updateProfile: (name) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name })
    }),
  uploadProfileImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    let response

    try {
      response = await fetch(`${API_BASE_URL}/profile/image`, {
        method: 'POST',
        body: formData
      })
    } catch (networkError) {
      console.error(`Request to ${API_BASE_URL}/profile/image failed:`, networkError)
      throw new Error(
        `Cannot reach MyFit backend at ${API_BASE_URL} (${networkError.message}). It may be a CORS or network issue.`
      )
    }

    if (!response.ok) {
      let message = response.statusText || 'Image upload failed'

      try {
        const body = await response.json()
        message = body.message || message
      } catch {
        // Response body wasn't JSON; fall back to statusText already set above.
      }

      throw new Error(`${response.status} ${message}`)
    }

    return response.json()
  }
}

export function resolveAssetUrl(path) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL.replace(/\/api$/, '')}${path}`
}
