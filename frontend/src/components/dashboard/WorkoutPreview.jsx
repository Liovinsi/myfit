import { Dumbbell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../common/StatusState.jsx'
import WorkoutDayPanel from '../workout/WorkoutDayPanel.jsx'
import { api, getTodayKey } from '../../lib/api.js'

export default function WorkoutPreview({ onStatusChange }) {
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isCompleting, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const dateKey = getTodayKey()

  async function loadTodayWorkout() {
    setError('')

    try {
      const workoutState = await api.getTodayWorkout(dateKey)
      setTodayWorkout(workoutState)
      onStatusChange?.(Boolean(workoutState.completed))
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)

      try {
        const workoutState = await api.getTodayWorkout(dateKey)

        if (isMounted) {
          setTodayWorkout(workoutState)
          onStatusChange?.(Boolean(workoutState.completed))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
          onStatusChange?.(false)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [dateKey, onStatusChange])

  async function saveProgress({ completedExercises, cardioCompleted }) {
    setError('')

    try {
      const result = await api.saveWorkoutProgress({ dateKey, completedExercises, cardioCompleted })
      setTodayWorkout((current) => (current ? { ...current, completion: result.completion } : current))
    } catch (progressError) {
      setError(progressError.message)
    }
  }

  async function completeWorkout(day) {
    setCompleting(true)
    setError('')

    try {
      await api.completeWorkout({ dateKey, day })
      await loadTodayWorkout()
    } catch (completeError) {
      setError(completeError.message)
    } finally {
      setCompleting(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading today's workout..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!todayWorkout?.workout) {
    return null
  }

  return (
    <section className="dashboard-card p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-navy">
          <Dumbbell className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-normal text-navy">Today's Workout</h2>
          <p className="text-sm font-bold leading-5 text-slate-600">
            {todayWorkout.workout.day} - {todayWorkout.workout.workoutName}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <WorkoutDayPanel
          workout={todayWorkout.workout}
          dateKey={todayWorkout.dateKey}
          completion={todayWorkout.completion}
          isCompleting={isCompleting}
          onComplete={completeWorkout}
          onProgressChange={saveProgress}
          compact
        />
      </div>
    </section>
  )
}
