import { useEffect, useMemo, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import WorkoutDayPanel from '../components/workout/WorkoutDayPanel.jsx'
import { api, getTodayKey } from '../lib/api.js'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function dayFromDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}

export default function Workout() {
  const [workouts, setWorkouts] = useState([])
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [selectedDay, setSelectedDay] = useState(dayFromDateKey(getTodayKey()))
  const [completion, setCompletion] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isCompleting, setCompleting] = useState(false)
  const [error, setError] = useState('')

  const selectedWorkout = useMemo(
    () => workouts.find((workout) => workout.day === selectedDay),
    [selectedDay, workouts]
  )

  async function loadCompletion(dateKey = selectedDate) {
    const completionState = await api.getWorkoutCompletion(dateKey)
    setCompletion(completionState.completion || null)
  }

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      setError('')
      setLoading(true)

      try {
        const [workoutList, completionState] = await Promise.all([
          api.getWorkouts(),
          api.getWorkoutCompletion(selectedDate)
        ])

        if (isMounted) {
          setWorkouts(workoutList)
          setCompletion(completionState.completion || null)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  async function saveWorkoutProgress({ completedExercises, cardioCompleted }) {
    setError('')

    try {
      const result = await api.saveWorkoutProgress({
        dateKey: selectedDate,
        completedExercises,
        cardioCompleted
      })
      setCompletion(result.completion || null)
    } catch (progressError) {
      setError(progressError.message)
    }
  }

  async function completeSelectedWorkout(day) {
    setCompleting(true)
    setError('')

    try {
      const result = await api.completeWorkout({ dateKey: selectedDate, day })
      setCompletion(result.completion || null)
      await loadCompletion(selectedDate)
    } catch (completeError) {
      setError(completeError.message)
    } finally {
      setCompleting(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading Workout..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Workout</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">🏋️ My Workout</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Monday – Saturday Workout Plan
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              const nextDate = event.target.value
              setSelectedDate(nextDate)
              setSelectedDay(dayFromDateKey(nextDate))
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
      </section>

      {error && <ErrorState message={error} />}

      <nav className="dashboard-card flex gap-2 overflow-x-auto p-2" aria-label="Workout days">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`shrink-0 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
              selectedDay === day
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </nav>

      <WorkoutDayPanel
        workout={selectedWorkout}
        dateKey={selectedDate}
        completion={completion}
        isCompleting={isCompleting}
        onComplete={completeSelectedWorkout}
        onProgressChange={saveWorkoutProgress}
      />
    </div>
  )
}
