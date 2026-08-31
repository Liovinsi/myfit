import { Flame, Moon, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api, getTodayKey } from '../lib/api.js'

const CALORIE_TARGET = 1300
const PROTEIN_TARGET = 70
const WATER_TARGET_ML = 3000

function previousDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

async function loadDaySnapshot(dateKey) {
  const [diet, stats, workout, weight] = await Promise.all([
    api.getTodayDiet(dateKey),
    api.getDailyStats(dateKey),
    api.getWorkoutCompletion(dateKey),
    api.getWeightEntry(dateKey)
  ])

  return {
    dateKey,
    caloriesConsumed: diet.totals?.calories || 0,
    proteinConsumed: diet.totals?.protein || 0,
    caloriesBurned: stats.caloriesBurned || 0,
    waterMl: stats.waterMl || 0,
    workoutCompleted: Boolean(workout.completed),
    cardioCompleted: Boolean(workout.completion?.cardioCompleted),
    weightKg: weight.entry?.weightKg ?? null
  }
}

function resultStatus(caloriesConsumed) {
  if (caloriesConsumed <= CALORIE_TARGET - 50) {
    return { label: 'Calorie Deficit Achieved', icon: '🔥', tone: 'text-emerald-700 bg-emerald-50' }
  }

  if (caloriesConsumed >= CALORIE_TARGET + 50) {
    return { label: 'Calorie Surplus', icon: '📈', tone: 'text-amber-700 bg-amber-50' }
  }

  return { label: 'Maintenance', icon: '⚖️', tone: 'text-blue-700 bg-blue-50' }
}

function ComparisonRow({ label, delta, unit, higherIsBetter }) {
  if (delta === 0) {
    return (
      <p className="flex items-center justify-between text-sm font-bold text-slate-500">
        {label}
        <span>No change</span>
      </p>
    )
  }

  const isImprovement = higherIsBetter ? delta > 0 : delta < 0
  const sign = delta > 0 ? '+' : ''

  return (
    <p className="flex items-center justify-between text-sm font-bold">
      <span className="text-slate-600">{label}</span>
      <span className={`flex items-center gap-1 ${isImprovement ? 'text-emerald-700' : 'text-rose-600'}`}>
        {delta > 0 ? (
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
        )}
        {sign}
        {delta}
        {unit} {isImprovement ? 'improvement' : ''}
      </span>
    </p>
  )
}

export default function NightSummary() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [today, setToday] = useState(null)
  const [yesterday, setYesterday] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    Promise.all([loadDaySnapshot(selectedDate), loadDaySnapshot(previousDateKey(selectedDate))])
      .then(([todaySnapshot, yesterdaySnapshot]) => {
        if (isMounted) {
          setToday(todaySnapshot)
          setYesterday(yesterdaySnapshot)
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  if (isLoading) {
    return <LoadingState label="Loading Night Summary..." />
  }

  const status = today ? resultStatus(today.caloriesConsumed) : null
  const dietCompletionPercent = today ? Math.min(100, Math.round((today.caloriesConsumed / CALORIE_TARGET) * 100)) : 0
  const proteinGoalPercent = today ? Math.min(100, Math.round((today.proteinConsumed / PROTEIN_TARGET) * 100)) : 0
  const waterGoalPercent = today ? Math.min(100, Math.round((today.waterMl / WATER_TARGET_ML) * 100)) : 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-navy p-6 text-white shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/70">Night Summary</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold">
            <Moon className="h-7 w-7" aria-hidden="true" />
            How Today Went
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
            Review before you sleep, and see how today compares to yesterday.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-white">
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-semibold text-white outline-none focus:border-white"
          />
        </label>
      </section>

      {error && <ErrorState message={error} />}

      {today && (
        <>
          <section className={`dashboard-card flex items-center gap-4 p-6 ${status.tone}`}>
            <span className="text-4xl" aria-hidden="true">
              {status.icon}
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">Result</p>
              <p className="text-2xl font-extrabold">{status.label}</p>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Calories Consumed</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{today.caloriesConsumed}</p>
            </article>
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Calories Burned</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{today.caloriesBurned}</p>
            </article>
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Protein Consumed</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{today.proteinConsumed}g</p>
            </article>
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Water Intake</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{(today.waterMl / 1000).toFixed(1)}L</p>
            </article>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Workout Status</p>
              <p className="mt-2 text-lg font-extrabold text-navy">
                {today.workoutCompleted ? 'Completed' : 'Not Completed'}
              </p>
            </article>
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Cardio Status</p>
              <p className="mt-2 text-lg font-extrabold text-navy">
                {today.cardioCompleted ? 'Completed' : 'Not Completed'}
              </p>
            </article>
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Weight</p>
              <p className="mt-2 text-lg font-extrabold text-navy">
                {today.weightKg != null ? `${today.weightKg} kg` : 'Not recorded'}
              </p>
            </article>
            <article className="dashboard-card flex items-center gap-3 p-5">
              <Flame className="h-6 w-6 text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-500">Calorie Target</p>
                <p className="text-lg font-extrabold text-navy">{CALORIE_TARGET} kcal</p>
              </div>
            </article>
          </section>

          <section className="dashboard-card p-5">
            <h2 className="text-lg font-extrabold text-navy">Goal Completion</h2>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Diet Completion', percent: dietCompletionPercent },
                { label: 'Protein Goal', percent: proteinGoalPercent },
                { label: 'Water Goal', percent: waterGoalPercent }
              ].map(({ label, percent }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                    <span>{label}</span>
                    <span className="text-navy">{percent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {yesterday && (
            <section className="dashboard-card p-5">
              <h2 className="text-lg font-extrabold text-navy">Compared to Yesterday</h2>
              <div className="mt-4 space-y-3">
                <ComparisonRow
                  label="Protein"
                  delta={Math.round((today.proteinConsumed - yesterday.proteinConsumed) * 10) / 10}
                  unit="g"
                  higherIsBetter
                />
                <ComparisonRow
                  label="Calories"
                  delta={Math.round(today.caloriesConsumed - yesterday.caloriesConsumed)}
                  unit=""
                  higherIsBetter={false}
                />
                <ComparisonRow
                  label="Water"
                  delta={Math.round((today.waterMl - yesterday.waterMl) / 10) / 100}
                  unit="L"
                  higherIsBetter
                />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
