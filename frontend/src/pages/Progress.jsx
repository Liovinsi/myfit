import { useEffect, useMemo, useRef, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import ActivityProgressSection from '../components/progress/ActivityProgressSection.jsx'
import BestStatsSection from '../components/progress/BestStatsSection.jsx'
import DailyNutritionSection from '../components/progress/DailyNutritionSection.jsx'
import MonthlyProgressSection from '../components/progress/MonthlyProgressSection.jsx'
import OverallScoreSection from '../components/progress/OverallScoreSection.jsx'
import ProgressRangeSelector from '../components/progress/ProgressRangeSelector.jsx'
import WeeklySummarySection from '../components/progress/WeeklySummarySection.jsx'
import WeightProgressSection from '../components/progress/WeightProgressSection.jsx'
import { api, getTodayKey } from '../lib/api.js'
import { computeBestStats, computeOverallScore } from '../lib/progressStats.js'

const RANGE_LABELS = {
  '7d': 'the last 7 days',
  '30d': 'the last 30 days',
  '3m': 'the last 3 months',
  all: 'all tracked time'
}

export default function Progress() {
  const [range, setRange] = useState('7d')
  const [rangeCache, setRangeCache] = useState({})
  const [today, setToday] = useState(null)
  const [weightHistory, setWeightHistory] = useState([])
  const [latestWeightKg, setLatestWeightKg] = useState(null)
  const [targetWeightKg, setTargetWeightKg] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isRangeLoading, setRangeLoading] = useState(false)
  const [error, setError] = useState('')
  const loadedRanges = useRef(new Set())

  useEffect(() => {
    let isMounted = true

    async function loadInitial() {
      setLoading(true)
      setError('')

      try {
        const dateKey = getTodayKey()
        const [diet, stats, workout, weightHistoryResult, latest, goal, historyResult] = await Promise.all([
          api.getTodayDiet(dateKey),
          api.getDailyStats(dateKey),
          api.getTodayWorkout(dateKey),
          api.getWeightHistory(100),
          api.getLatestWeight(),
          api.getWeightGoal(),
          api.getProgressHistory('7d')
        ])

        if (!isMounted) {
          return
        }

        setToday({
          calories: diet.totals?.calories || 0,
          protein: diet.totals?.protein || 0,
          fiber: diet.totals?.fiber || 0,
          carbs: diet.totals?.carbs || 0,
          fat: diet.totals?.fat || 0,
          steps: stats.steps || 0,
          waterMl: stats.waterMl || 0,
          workoutCompleted: Boolean(workout.completed),
          cardioCompleted: Boolean(workout.completion?.cardioCompleted),
          restDay: workout.workout?.day === 'Sunday'
        })
        setWeightHistory(weightHistoryResult.entries || [])
        setLatestWeightKg(latest.entry?.weightKg ?? null)
        setTargetWeightKg(goal.targetWeightKg ?? null)
        loadedRanges.current.add('7d')
        setRangeCache({ '7d': historyResult })
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

    loadInitial()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isLoading || loadedRanges.current.has(range)) {
      return
    }

    let isMounted = true

    async function loadRange() {
      setRangeLoading(true)
      setError('')

      try {
        const result = await api.getProgressHistory(range)

        if (isMounted) {
          loadedRanges.current.add(range)
          setRangeCache((current) => ({ ...current, [range]: result }))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setRangeLoading(false)
        }
      }
    }

    loadRange()

    return () => {
      isMounted = false
    }
  }, [range, isLoading])

  const days = rangeCache[range]?.days || []

  const weightByDate = useMemo(() => {
    const map = {}
    weightHistory.forEach((entry) => {
      map[entry.dateKey] = entry.weightKg
    })
    return map
  }, [weightHistory])

  const last7Days = useMemo(() => days.slice(-7), [days])

  const chartEntries = useMemo(() => {
    if (days.length === 0) {
      return [...weightHistory].reverse()
    }

    const startDateKey = days[0].dateKey
    return [...weightHistory].filter((entry) => entry.dateKey >= startDateKey).reverse()
  }, [weightHistory, days])

  const overallScore = useMemo(
    () => computeOverallScore(days, latestWeightKg, targetWeightKg, weightHistory),
    [days, latestWeightKg, targetWeightKg, weightHistory]
  )
  const bestStats = useMemo(() => computeBestStats(days, weightHistory), [days, weightHistory])

  const hasAnyDailyData = days.some((day) => day.calories > 0 || day.steps > 0 || day.waterMl > 0 || day.workoutCompleted)
  const hasWeightData = weightHistory.length > 0
  const hasAnyData = hasAnyDailyData || hasWeightData

  if (isLoading) {
    return <LoadingState label="Loading Progress..." />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-card md:p-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Progress</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">Your Progress</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Every small step compounds — keep showing up for yourself.
        </p>
        <div className="mt-5">
          <ProgressRangeSelector value={range} onChange={setRange} />
        </div>
      </section>

      {error && <ErrorState message={error} />}

      {today && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyNutritionSection
            calories={today.calories}
            protein={today.protein}
            waterMl={today.waterMl}
            fiber={today.fiber}
            carbs={today.carbs}
            fat={today.fat}
          />
          <ActivityProgressSection
            steps={today.steps}
            workoutCompleted={today.workoutCompleted}
            cardioCompleted={today.cardioCompleted}
            restDay={today.restDay}
          />
        </div>
      )}

      {isRangeLoading ? (
        <LoadingState label="Loading range data..." />
      ) : hasAnyData ? (
        <>
          {hasWeightData ? (
            <WeightProgressSection
              history={weightHistory}
              latestWeightKg={latestWeightKg}
              targetWeightKg={targetWeightKg}
              chartEntries={chartEntries}
            />
          ) : (
            <section className="dashboard-card p-5">
              <h2 className="text-lg font-extrabold text-navy">Weight Progress</h2>
              <div className="mt-4">
                <EmptyState
                  title="No weight logged yet"
                  message="Keep tracking your daily activities to build your progress history."
                />
              </div>
            </section>
          )}

          <WeeklySummarySection days={last7Days} weightByDate={weightByDate} />

          {range !== '7d' && <MonthlyProgressSection days={days} rangeLabel={RANGE_LABELS[range]} />}

          <OverallScoreSection score={overallScore.score} metrics={overallScore.metrics} rangeLabel={RANGE_LABELS[range]} />

          <BestStatsSection stats={bestStats} />
        </>
      ) : (
        <section className="dashboard-card p-10 text-center">
          <EmptyState
            title="Not enough history yet"
            message="Keep tracking your daily activities to build your progress history."
          />
        </section>
      )}
    </div>
  )
}
