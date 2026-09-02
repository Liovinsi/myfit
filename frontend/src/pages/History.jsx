import { ChevronLeft, ChevronRight, Droplets, Dumbbell, Flame, Footprints, Utensils, Weight } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatCard from '../components/dashboard/StatCard.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import DailyCompletionSection from '../components/history/DailyCompletionSection.jsx'
import DietHistorySection from '../components/history/DietHistorySection.jsx'
import ProteinHistorySection from '../components/history/ProteinHistorySection.jsx'
import WaterStepsHistorySection from '../components/history/WaterStepsHistorySection.jsx'
import WorkoutHistorySection from '../components/history/WorkoutHistorySection.jsx'
import { api, getTodayKey } from '../lib/api.js'

const CALORIE_TARGET = 1300
const PROTEIN_TARGET = 70
const STEPS_TARGET = 5000

function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return getTodayKey(date)
}

function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function History() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [diet, setDiet] = useState({ entries: [], meals: {}, totals: { calories: 0, protein: 0, fiber: 0 } })
  const [dailyStats, setDailyStats] = useState({ steps: 0, waterMl: 0 })
  const [workoutState, setWorkoutState] = useState(null)
  const [weightEntry, setWeightEntry] = useState(null)
  const [routine, setRoutine] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDay() {
      setLoading(true)
      setError('')

      try {
        const [dietResult, statsResult, workoutResult, weightResult, routineResult] = await Promise.all([
          api.getTodayDiet(selectedDate),
          api.getDailyStats(selectedDate),
          api.getTodayWorkout(selectedDate),
          api.getWeightEntry(selectedDate),
          api.getRoutine(selectedDate)
        ])

        if (isMounted) {
          setDiet(dietResult)
          setDailyStats(statsResult)
          setWorkoutState(workoutResult)
          setWeightEntry(weightResult.entry)
          setRoutine(routineResult)
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

    loadDay()

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  const calories = diet.totals?.calories || 0
  const protein = diet.totals?.protein || 0
  const steps = dailyStats.steps || 0
  const waterMl = dailyStats.waterMl || 0
  const waterLitres = Math.round((waterMl / 1000) * 10) / 10
  const workoutCompleted = Boolean(workoutState?.completed)
  const isToday = selectedDate === getTodayKey()

  const routineCompletedCount = routine?.completedCount || 0

  const hasAnyActivity =
    diet.entries.length > 0 ||
    steps > 0 ||
    waterMl > 0 ||
    workoutCompleted ||
    weightEntry != null ||
    routineCompletedCount > 0

  if (isLoading) {
    return <LoadingState label="Loading History..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">History</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">History</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Review your daily fitness journey</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDateKey(current, -1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDateKey(current, 1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayKey())}
              disabled={isToday}
              className="rounded-xl bg-navy px-4 py-2 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Today
            </button>
          </div>
          <p className="text-sm font-bold text-slate-600">{formatDisplayDate(selectedDate)}</p>
        </div>
      </section>

      {error && <ErrorState message={error} />}

      {!hasAnyActivity ? (
        <section className="dashboard-card p-10 text-center">
          <EmptyState title="No activity recorded" message="No activity recorded for this date." />
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Calories" value={`${calories} / ${CALORIE_TARGET} kcal`} icon={Flame} tone="pink" />
            <StatCard title="Protein" value={`${protein} / ${PROTEIN_TARGET} g`} icon={Utensils} tone="navy" />
            <StatCard title="Water" value={`${waterLitres} / 4 L`} icon={Droplets} tone="blue" />
            <StatCard title="Steps" value={`${steps} / ${STEPS_TARGET}`} icon={Footprints} tone="green" />
            <StatCard
              title="Workout"
              value={workoutCompleted ? 'Completed' : 'Not Completed'}
              icon={Dumbbell}
              tone="navy"
            />
            <StatCard
              title="Weight"
              value={weightEntry ? `${weightEntry.weightKg} kg` : 'Not recorded'}
              icon={Weight}
              tone="blue"
            />
          </section>

          <DailyCompletionSection
            calories={calories}
            protein={protein}
            waterMl={waterMl}
            steps={steps}
            workoutCompleted={workoutCompleted}
            routineCompletionPercent={routine?.completionPercent || 0}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DietHistorySection meals={diet.meals} totals={diet.totals} />
            <ProteinHistorySection entries={diet.entries} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <WaterStepsHistorySection waterMl={waterMl} steps={steps} />
            <WorkoutHistorySection
              workout={workoutState?.workout}
              completion={workoutState?.completion}
              completed={workoutCompleted}
            />
          </div>
        </>
      )}
    </div>
  )
}
