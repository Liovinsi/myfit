import DailyStats from '../models/DailyStats.js'
import DietEntry from '../models/DietEntry.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { todayDateKey } from '../utils/nutrition.js'

const RANGE_DAY_COUNTS = {
  '7d': 7,
  '30d': 30,
  '3m': 90,
  all: 365
}

function parseDateKeyUTC(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function dateKeyFromUTC(date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function weekdayFromDateKey(dateKey) {
  const date = parseDateKeyUTC(dateKey)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}

function buildDateRange(endDateKey, dayCount) {
  const endDate = parseDateKeyUTC(endDateKey)
  const dates = []

  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const day = new Date(endDate)
    day.setUTCDate(endDate.getUTCDate() - i)
    dates.push(dateKeyFromUTC(day))
  }

  return dates
}

async function dietTotalsByDateRange(dates) {
  const rows = await DietEntry.aggregate([
    { $match: { dateKey: { $in: dates } } },
    {
      $group: {
        _id: '$dateKey',
        calories: { $sum: '$nutrition.calories' },
        protein: { $sum: '$nutrition.protein' },
        fiber: { $sum: '$nutrition.fiber' }
      }
    }
  ])

  const totalsByDate = {}

  rows.forEach((row) => {
    totalsByDate[row._id] = {
      calories: Math.round(row.calories * 10) / 10,
      protein: Math.round(row.protein * 10) / 10,
      fiber: Math.round(row.fiber * 10) / 10
    }
  })

  return totalsByDate
}

/**
 * Single aggregated endpoint for the Progress page's historical charts/summaries.
 * Reuses the existing DietEntry/DailyStats/WorkoutCompletion collections directly
 * (no nutrition/workout logic is recomputed, only already-stored values are read)
 * so the frontend doesn't need one API call per day for a 7/30/90/365-day range.
 */
export async function getProgressHistory(req, res, next) {
  try {
    const range = RANGE_DAY_COUNTS[req.query.range] ? req.query.range : '7d'
    const dayCount = RANGE_DAY_COUNTS[range]
    const endDateKey = todayDateKey()
    const dates = buildDateRange(endDateKey, dayCount)

    const [statsRows, workoutRows, dietTotals] = await Promise.all([
      DailyStats.find({ dateKey: { $in: dates } }).lean(),
      WorkoutCompletion.find({ dateKey: { $in: dates } }).lean(),
      dietTotalsByDateRange(dates)
    ])

    const statsByDate = Object.fromEntries(statsRows.map((row) => [row.dateKey, row]))
    const workoutByDate = Object.fromEntries(workoutRows.map((row) => [row.dateKey, row]))

    const days = dates.map((dateKey) => {
      const stats = statsByDate[dateKey]
      const workout = workoutByDate[dateKey]
      const diet = dietTotals[dateKey]

      return {
        dateKey,
        restDay: weekdayFromDateKey(dateKey) === 'Sunday',
        calories: diet?.calories || 0,
        protein: diet?.protein || 0,
        fiber: diet?.fiber || 0,
        steps: stats?.steps || 0,
        waterMl: stats?.waterMl || 0,
        workoutCompleted: Boolean(workout?.completed),
        cardioCompleted: Boolean(workout?.cardioCompleted)
      }
    })

    res.json({
      range,
      startDateKey: dates[0],
      endDateKey: dates[dates.length - 1],
      days
    })
  } catch (error) {
    next(error)
  }
}
