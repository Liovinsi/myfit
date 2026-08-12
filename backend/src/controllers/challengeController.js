import { DAILY_CHALLENGES, WEEKLY_CHALLENGES } from '../data/challenges.js'
import ChallengeProgress from '../models/ChallengeProgress.js'
import DailyStats from '../models/DailyStats.js'
import DietEntry from '../models/DietEntry.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { todayDateKey } from '../utils/nutrition.js'

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

function getWeekDates(dateKey) {
  const date = parseDateKeyUTC(dateKey)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const dayOfWeek = date.getUTCDay()
  const mondayOffset = (dayOfWeek + 6) % 7
  const monday = new Date(date)
  monday.setUTCDate(date.getUTCDate() - mondayOffset)

  const allDates = []

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(monday)
    day.setUTCDate(monday.getUTCDate() + i)
    allDates.push(dateKeyFromUTC(day))
  }

  return {
    weekStartKey: allDates[0],
    allDates,
    workoutDates: allDates.slice(0, 6)
  }
}

async function dietTotalsByDate(dates) {
  const rows = await DietEntry.aggregate([
    { $match: { dateKey: { $in: dates } } },
    {
      $group: {
        _id: '$dateKey',
        calories: { $sum: '$nutrition.calories' },
        protein: { $sum: '$nutrition.protein' }
      }
    }
  ])

  const totalsByDate = {}

  rows.forEach((row) => {
    totalsByDate[row._id] = {
      calories: Math.round(row.calories * 10) / 10,
      protein: Math.round(row.protein * 10) / 10
    }
  })

  return totalsByDate
}

async function computeDailyChallenge(challenge, dateKey) {
  switch (challenge.id) {
    case 'daily-workout': {
      const weekday = weekdayFromDateKey(dateKey)
      const completion = await WorkoutCompletion.findOne({ dateKey }).lean()
      const done = weekday === 'Sunday' || Boolean(completion?.completed)
      return { progress: done ? 1 : 0, completed: done }
    }

    case 'daily-steps': {
      const stats = await DailyStats.findOne({ dateKey }).lean()
      const steps = stats?.steps || 0
      return { progress: steps, completed: steps >= challenge.target }
    }

    case 'daily-water': {
      const stats = await DailyStats.findOne({ dateKey }).lean()
      const waterMl = stats?.waterMl || 0
      return { progress: waterMl, completed: waterMl >= challenge.target }
    }

    case 'daily-protein': {
      const totalsByDate = await dietTotalsByDate([dateKey])
      const protein = totalsByDate[dateKey]?.protein || 0
      return { progress: protein, completed: protein >= challenge.target }
    }

    case 'daily-calories': {
      const totalsByDate = await dietTotalsByDate([dateKey])
      const calories = totalsByDate[dateKey]?.calories || 0
      // Require at least half the budget logged before treating "within budget" as meaningful,
      // otherwise a single small breakfast would trivially (and permanently, once frozen) complete
      // this challenge. There is no end-of-day finalization concept in this app to check against instead.
      const completed = calories >= challenge.target * 0.5 && calories <= challenge.target
      return { progress: calories, completed }
    }

    default:
      return { progress: 0, completed: false }
  }
}

async function computeWeeklyChallenge(challenge, weekInfo) {
  switch (challenge.id) {
    case 'weekly-workout': {
      const count = await WorkoutCompletion.countDocuments({
        dateKey: { $in: weekInfo.workoutDates },
        completed: true
      })
      return { progress: count, completed: count >= challenge.target }
    }

    case 'weekly-steps': {
      const stats = await DailyStats.find({ dateKey: { $in: weekInfo.allDates } }).lean()
      const count = stats.filter((entry) => entry.steps >= 5000).length
      return { progress: count, completed: count >= challenge.target }
    }

    case 'weekly-water': {
      const stats = await DailyStats.find({ dateKey: { $in: weekInfo.allDates } }).lean()
      const count = stats.filter((entry) => entry.waterMl >= 4000).length
      return { progress: count, completed: count >= challenge.target }
    }

    case 'weekly-protein': {
      const totalsByDate = await dietTotalsByDate(weekInfo.allDates)
      const count = Object.values(totalsByDate).filter((entry) => entry.protein >= 70).length
      return { progress: count, completed: count >= challenge.target }
    }

    default:
      return { progress: 0, completed: false }
  }
}

/**
 * Persists progress and auto-claims the reward the first time a challenge is completed.
 * completed/rewardClaimed only ever move false -> true for a given (challengeId, period),
 * so a page refresh (or any later recompute) can never re-award or un-award a challenge.
 */
async function syncChallengeProgress(challengeId, period, computedProgress, computedCompleted) {
  const existing = await ChallengeProgress.findOne({ challengeId, period }).lean()
  const wasCompleted = Boolean(existing?.completed)
  const isCompleted = wasCompleted || computedCompleted

  const setFields = {
    completed: isCompleted,
    rewardClaimed: Boolean(existing?.rewardClaimed) || isCompleted
  }

  if (!wasCompleted) {
    setFields.progress = computedProgress
  }

  if (!wasCompleted && isCompleted) {
    setFields.claimedAt = new Date()
  }

  return ChallengeProgress.findOneAndUpdate(
    { challengeId, period },
    { $set: setFields, $setOnInsert: { challengeId, period } },
    { new: true, upsert: true, runValidators: true }
  ).lean()
}

function toChallengeResponse(challenge, period, saved) {
  const percent = challenge.target > 0 ? Math.min(100, Math.round((saved.progress / challenge.target) * 100)) : 0

  return {
    ...challenge,
    period,
    progress: saved.progress,
    completed: saved.completed,
    rewardClaimed: saved.rewardClaimed,
    percent
  }
}

export async function getTodayChallenges(req, res, next) {
  try {
    const dateKey = req.query.date || todayDateKey()
    const weekday = weekdayFromDateKey(dateKey)

    if (!weekday) {
      return res.status(400).json({ message: 'A valid date is required' })
    }

    const challenges = []

    for (const challenge of DAILY_CHALLENGES) {
      const { progress, completed } = await computeDailyChallenge(challenge, dateKey)
      const saved = await syncChallengeProgress(challenge.id, dateKey, progress, completed)
      challenges.push(toChallengeResponse(challenge, dateKey, saved))
    }

    res.json({ dateKey, challenges })
  } catch (error) {
    next(error)
  }
}

export async function getWeeklyChallenges(req, res, next) {
  try {
    const dateKey = req.query.date || todayDateKey()
    const weekInfo = getWeekDates(dateKey)

    if (!weekInfo) {
      return res.status(400).json({ message: 'A valid date is required' })
    }

    const challenges = []

    for (const challenge of WEEKLY_CHALLENGES) {
      const { progress, completed } = await computeWeeklyChallenge(challenge, weekInfo)
      const saved = await syncChallengeProgress(challenge.id, weekInfo.weekStartKey, progress, completed)
      challenges.push(toChallengeResponse(challenge, weekInfo.weekStartKey, saved))
    }

    res.json({ weekStartKey: weekInfo.weekStartKey, weekDates: weekInfo.allDates, challenges })
  } catch (error) {
    next(error)
  }
}
