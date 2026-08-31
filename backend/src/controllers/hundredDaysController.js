import HundredDaysEntry from '../models/HundredDaysEntry.js'
import HundredDaysSettings from '../models/HundredDaysSettings.js'
import { todayDateKey } from '../utils/nutrition.js'

const TOTAL_DAYS = 100

function addDays(dateKey, daysToAdd) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + daysToAdd)

  const resultYear = date.getUTCFullYear()
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const resultDay = String(date.getUTCDate()).padStart(2, '0')
  return `${resultYear}-${resultMonth}-${resultDay}`
}

async function getOrCreateSettings() {
  let settings = await HundredDaysSettings.findOne().lean()

  if (!settings) {
    settings = await HundredDaysSettings.create({ startDateKey: todayDateKey() })
    settings = settings.toObject()
  }

  return settings
}

async function buildChallenge() {
  const settings = await getOrCreateSettings()
  const entries = await HundredDaysEntry.find().lean()
  const entryByDay = new Map(entries.map((entry) => [entry.dayNumber, entry]))
  const today = todayDateKey()

  const days = Array.from({ length: TOTAL_DAYS }, (_, index) => {
    const dayNumber = index + 1
    const dateKey = addDays(settings.startDateKey, index)
    const entry = entryByDay.get(dayNumber)

    return {
      dayNumber,
      dateKey,
      completed: Boolean(entry?.completed),
      isToday: dateKey === today,
      isPast: dateKey < today,
      isFuture: dateKey > today
    }
  })

  const totalCompleted = days.filter((day) => day.completed).length

  let longestStreak = 0
  let runningStreak = 0
  days.forEach((day) => {
    if (day.completed) {
      runningStreak += 1
      longestStreak = Math.max(longestStreak, runningStreak)
    } else {
      runningStreak = 0
    }
  })

  const currentDayIndex = days.findIndex((day) => day.isToday)
  const activeUpToIndex = currentDayIndex === -1 ? days.filter((day) => day.isPast).length - 1 : currentDayIndex

  let currentStreak = 0
  for (let index = activeUpToIndex; index >= 0; index -= 1) {
    if (days[index].completed) {
      currentStreak += 1
    } else {
      break
    }
  }

  return {
    startDateKey: settings.startDateKey,
    days,
    totalCompleted,
    progressPercent: Math.round((totalCompleted / TOTAL_DAYS) * 100),
    currentStreak,
    longestStreak,
    daysRemaining: TOTAL_DAYS - totalCompleted
  }
}

export async function getHundredDaysChallenge(req, res, next) {
  try {
    res.json(await buildChallenge())
  } catch (error) {
    next(error)
  }
}

export async function toggleHundredDaysDay(req, res, next) {
  try {
    const dayNumber = Number(req.params.dayNumber)

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > TOTAL_DAYS) {
      return res.status(400).json({ message: 'dayNumber must be between 1 and 100' })
    }

    const existing = await HundredDaysEntry.findOne({ dayNumber })
    const nextCompleted = !existing?.completed

    await HundredDaysEntry.findOneAndUpdate(
      { dayNumber },
      {
        $set: {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : null
        }
      },
      { upsert: true, runValidators: true }
    )

    res.json(await buildChallenge())
  } catch (error) {
    next(error)
  }
}

export async function resetHundredDaysChallenge(req, res, next) {
  try {
    await HundredDaysEntry.deleteMany({})
    await HundredDaysSettings.deleteMany({})
    await HundredDaysSettings.create({ startDateKey: req.body?.startDateKey || todayDateKey() })
    res.json(await buildChallenge())
  } catch (error) {
    next(error)
  }
}
