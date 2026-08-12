import { getWorkoutByDay, workoutPlan } from '../data/workoutPlan.js'
import WorkoutCompletion from '../models/WorkoutCompletion.js'
import { dateKeyFromRequest, todayDateKey } from '../utils/nutrition.js'

function weekdayFromDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}

async function completionForDate(dateKey) {
  return WorkoutCompletion.findOne({ dateKey }).lean()
}

export async function getWorkouts(req, res, next) {
  try {
    res.json(workoutPlan)
  } catch (error) {
    next(error)
  }
}

export async function getWorkout(req, res, next) {
  try {
    const workout = getWorkoutByDay(req.params.day)

    if (!workout) {
      return res.status(404).json({ message: 'Workout day not found' })
    }

    res.json(workout)
  } catch (error) {
    next(error)
  }
}

export async function getTodayWorkout(req, res, next) {
  try {
    const dateKey = dateKeyFromRequest(req)
    const day = weekdayFromDateKey(dateKey)
    const workout = getWorkoutByDay(day)
    const completion = await completionForDate(dateKey)

    res.json({
      dateKey,
      workout,
      completion,
      completed: Boolean(completion?.completed)
    })
  } catch (error) {
    next(error)
  }
}

export async function getWorkoutCompletion(req, res, next) {
  try {
    const dateKey = req.params.dateKey || todayDateKey()
    const completion = await completionForDate(dateKey)

    res.json({
      dateKey,
      completion,
      completed: Boolean(completion?.completed)
    })
  } catch (error) {
    next(error)
  }
}

export async function completeWorkout(req, res, next) {
  try {
    const dateKey = req.body.dateKey || todayDateKey()
    const day = weekdayFromDateKey(dateKey)
    const workout = getWorkoutByDay(day)

    if (!workout) {
      return res.status(400).json({ message: 'No workout is scheduled for this date' })
    }

    if (workout.day === 'Sunday') {
      return res.status(400).json({ message: 'Sunday is a rest day' })
    }

    const existing = await WorkoutCompletion.findOne({ dateKey }).lean()

    if (existing?.completed) {
      return res.json({
        completion: existing,
        completed: true,
        created: false,
        coinsAwarded: 0
      })
    }

    const completion = await WorkoutCompletion.findOneAndUpdate(
      { dateKey },
      {
        $set: {
          day: workout.day,
          workoutName: workout.workoutName,
          completed: true,
          completedAt: new Date()
        },
        $setOnInsert: { dateKey }
      },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.status(existing ? 200 : 201).json({
      completion,
      completed: true,
      created: !existing,
      coinsAwarded: 0
    })
  } catch (error) {
    if (error.code === 11000) {
      const completion = await WorkoutCompletion.findOne({ dateKey: req.body.dateKey || todayDateKey() }).lean()
      return res.json({
        completion,
        completed: true,
        created: false,
        coinsAwarded: 0
      })
    }

    next(error)
  }
}

export async function saveWorkoutProgress(req, res, next) {
  try {
    const dateKey = req.body.dateKey || todayDateKey()
    const day = weekdayFromDateKey(dateKey)
    const workout = getWorkoutByDay(day)

    if (!workout) {
      return res.status(400).json({ message: 'No workout is scheduled for this date' })
    }

    if (workout.day === 'Sunday') {
      return res.status(400).json({ message: 'Sunday is a rest day' })
    }

    const validExerciseNames = new Set(workout.exercises.map((exercise) => exercise.name))
    const hasCompletedExercises = Array.isArray(req.body.completedExercises)
    const hasCardioCompleted = typeof req.body.cardioCompleted === 'boolean'

    if (!hasCompletedExercises && !hasCardioCompleted) {
      return res.status(400).json({ message: 'completedExercises or cardioCompleted is required' })
    }

    const setFields = {}

    if (hasCompletedExercises) {
      setFields.completedExercises = [
        ...new Set(req.body.completedExercises.filter((name) => validExerciseNames.has(name)))
      ]
    }

    if (hasCardioCompleted) {
      setFields.cardioCompleted = req.body.cardioCompleted
    }

    const completion = await WorkoutCompletion.findOneAndUpdate(
      { dateKey },
      {
        $set: setFields,
        $setOnInsert: {
          dateKey,
          day: workout.day,
          workoutName: workout.workoutName,
          completed: false
        }
      },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json({
      completion,
      completed: Boolean(completion?.completed)
    })
  } catch (error) {
    next(error)
  }
}
