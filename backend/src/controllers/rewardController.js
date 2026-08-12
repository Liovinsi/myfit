import { DAILY_CHALLENGES } from '../data/challenges.js'
import ChallengeProgress from '../models/ChallengeProgress.js'
import CoinTransaction from '../models/CoinTransaction.js'
import DailyStats from '../models/DailyStats.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { todayDateKey } from '../utils/nutrition.js'

const REWARD_COINS = 10
const STEPS_TARGET = 5000
const WATER_TARGET_ML = 4000
const SYNC_WINDOW_DAYS = 365

const DAILY_CHALLENGE_IDS = new Set(DAILY_CHALLENGES.map((challenge) => challenge.id))
const DAILY_CHALLENGE_NAMES = Object.fromEntries(DAILY_CHALLENGES.map((challenge) => [challenge.id, challenge.name]))

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

function recentDateKeys(endDateKey, dayCount) {
  const endDate = parseDateKeyUTC(endDateKey)
  const dates = []

  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const day = new Date(endDate)
    day.setUTCDate(endDate.getUTCDate() - i)
    dates.push(dateKeyFromUTC(day))
  }

  return dates
}

/**
 * Awards a reward exactly once for a given (dateKey, rewardType, sourceId).
 * The unique index on CoinTransaction is the actual enforcement point — this upsert
 * is a no-op if the reward already exists, so MongoDB (not the caller) decides whether
 * a reward is new. Safe to call repeatedly with the same inputs.
 */
async function ensureReward({ dateKey, rewardType, sourceId, description, coins }) {
  await CoinTransaction.findOneAndUpdate(
    { dateKey, rewardType, sourceId },
    { $setOnInsert: { dateKey, rewardType, sourceId, description, coins } },
    { upsert: true, runValidators: true }
  )
}

/**
 * Re-derives which rewards should exist for the given dates by reading the existing
 * WorkoutCompletion / DailyStats / ChallengeProgress collections directly (no reward
 * logic is duplicated from those modules — only their already-computed completed/
 * threshold state is read) and ensures each qualifying reward exists exactly once.
 */
async function syncRewardsForDates(dates) {
  const [statsRows, workoutRows, challengeRows] = await Promise.all([
    DailyStats.find({ dateKey: { $in: dates } }).lean(),
    WorkoutCompletion.find({ dateKey: { $in: dates } }).lean(),
    ChallengeProgress.find({ period: { $in: dates }, completed: true }).lean()
  ])

  const tasks = []

  statsRows.forEach((stats) => {
    if (stats.steps >= STEPS_TARGET) {
      tasks.push(
        ensureReward({
          dateKey: stats.dateKey,
          rewardType: 'steps',
          sourceId: 'steps',
          description: '5K Steps',
          coins: REWARD_COINS
        })
      )
    }

    if (stats.waterMl >= WATER_TARGET_ML) {
      tasks.push(
        ensureReward({
          dateKey: stats.dateKey,
          rewardType: 'water',
          sourceId: 'water',
          description: '4L Water',
          coins: REWARD_COINS
        })
      )
    }
  })

  workoutRows.forEach((workout) => {
    if (workout.completed) {
      tasks.push(
        ensureReward({
          dateKey: workout.dateKey,
          rewardType: 'workout',
          sourceId: 'workout',
          description: 'Workout Completed',
          coins: REWARD_COINS
        })
      )
    }
  })

  challengeRows.forEach((progress) => {
    if (DAILY_CHALLENGE_IDS.has(progress.challengeId)) {
      const challengeName = DAILY_CHALLENGE_NAMES[progress.challengeId] || progress.challengeId

      tasks.push(
        ensureReward({
          dateKey: progress.period,
          rewardType: 'challenge',
          sourceId: progress.challengeId,
          description: `Challenge Completed: ${challengeName}`,
          coins: REWARD_COINS
        })
      )
    }
  })

  await Promise.all(tasks)
}

export async function getRewardsForDate(req, res, next) {
  try {
    const dateKey = req.params.date || todayDateKey()

    await syncRewardsForDates([dateKey])

    const transactions = await CoinTransaction.find({ dateKey }).sort({ createdAt: 1 }).lean()
    const totalCoins = transactions.reduce((sum, transaction) => sum + transaction.coins, 0)

    res.json({ dateKey, transactions, totalCoins })
  } catch (error) {
    next(error)
  }
}

export async function getRewards(req, res, next) {
  try {
    const today = todayDateKey()

    await syncRewardsForDates(recentDateKeys(today, SYNC_WINDOW_DAYS))

    const transactions = await CoinTransaction.find().sort({ dateKey: -1, createdAt: 1 }).lean()
    const totalCoins = transactions.reduce((sum, transaction) => sum + transaction.coins, 0)
    const todayCoins = transactions
      .filter((transaction) => transaction.dateKey === today)
      .reduce((sum, transaction) => sum + transaction.coins, 0)

    res.json({ totalCoins, todayCoins, transactions })
  } catch (error) {
    next(error)
  }
}
