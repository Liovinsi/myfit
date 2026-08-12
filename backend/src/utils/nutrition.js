export function calculateNutrition(food, quantityAmount) {
  const ratio = quantityAmount / food.defaultQuantity.amount

  return {
    calories: roundNutrition(food.nutrition.calories * ratio),
    protein: roundNutrition(food.nutrition.protein * ratio),
    fiber: roundNutrition(food.nutrition.fiber * ratio)
  }
}

export function roundNutrition(value) {
  return Math.round((Number(value) || 0) * 10) / 10
}

export function dateKeyFromRequest(req) {
  return req.query.date || req.body?.dateKey || todayDateKey()
}

export function todayDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
