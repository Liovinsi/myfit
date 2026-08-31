import {
  Droplets,
  Flame,
  Footprints,
  HandCoins,
  HeartPulse,
  ShieldCheck,
  Utensils,
  Weight
} from 'lucide-react'
import { useEffect, useState } from 'react'
import FutureSelfSection from '../components/dashboard/FutureSelfSection.jsx'
import DailyTrackingCard from '../components/dashboard/DailyTrackingCard.jsx'
import MotivationCard from '../components/dashboard/MotivationCard.jsx'
import ProgressCard from '../components/dashboard/ProgressCard.jsx'
import ProteinSection from '../components/dashboard/ProteinSection.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import TodaysChallengesCard from '../components/dashboard/TodaysChallengesCard.jsx'
import WorkoutPreview from '../components/dashboard/WorkoutPreview.jsx'
import { api, getTodayKey } from '../lib/api.js'

function formatToday(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function Dashboard() {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, fiber: 0 })
  const [dailyStats, setDailyStats] = useState({ steps: 0, waterMl: 0, caloriesBurned: 0 })
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [stepsInput, setStepsInput] = useState('0')
  const [waterInput, setWaterInput] = useState('0')
  const [burnedInput, setBurnedInput] = useState('0')
  const [suggestedBurn, setSuggestedBurn] = useState(0)
  const [workoutState, setWorkoutState] = useState(null)
  const [currentWeightKg, setCurrentWeightKg] = useState(null)
  const [targetWeightKg, setTargetWeightKg] = useState(null)
  const [startWeightKg, setStartWeightKg] = useState(null)
  const [totalCoins, setTotalCoins] = useState(0)
  const [status, setStatus] = useState('loading')
  const [statsStatus, setStatsStatus] = useState('loading')
  const [statsError, setStatsError] = useState('')
  const [savingSteps, setSavingSteps] = useState(false)
  const [savingWater, setSavingWater] = useState(false)
  const [savingBurned, setSavingBurned] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadDashboardDate() {
      setStatus('loading')
      setStatsStatus('loading')
      setStatsError('')

      try {
        const [diet, stats, suggested] = await Promise.all([
          api.getTodayDiet(selectedDate),
          api.getDailyStats(selectedDate),
          api.getSuggestedCaloriesBurned(selectedDate)
        ])

        if (isMounted) {
          setTotals(diet.totals || { calories: 0, protein: 0, fiber: 0 })
          setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
          setStepsInput(String(stats.steps || 0))
          setWaterInput(String(stats.waterMl || 0))
          setBurnedInput(String(stats.caloriesBurned || 0))
          setSuggestedBurn(suggested.suggestedCaloriesBurned || 0)
          setStatus('ready')
          setStatsStatus('ready')
        }
      } catch (loadError) {
        if (isMounted) {
          setStatus('error')
          setStatsStatus('error')
          setStatsError(loadError.message)
        }
      }
    }

    loadDashboardDate()

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  useEffect(() => {
    let isMounted = true

    async function loadWeight() {
      try {
        const [latest, goal, history] = await Promise.all([
          api.getLatestWeight(),
          api.getWeightGoal(),
          api.getWeightHistory(100)
        ])

        if (isMounted) {
          setCurrentWeightKg(latest.entry?.weightKg ?? null)
          setTargetWeightKg(goal.targetWeightKg ?? null)
          const entries = Array.isArray(history) ? history : []
          const oldest = entries[entries.length - 1]
          setStartWeightKg(oldest?.weightKg ?? null)
        }
      } catch {
        // Current Weight card falls back to its placeholder values below.
      }
    }

    loadWeight()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadCoins() {
      try {
        const result = await api.getRewards()

        if (isMounted) {
          setTotalCoins(result.totalCoins || 0)
        }
      } catch {
        // Coins card falls back to its placeholder value below.
      }
    }

    loadCoins()

    return () => {
      isMounted = false
    }
  }, [])

  const calories = status === 'ready' ? totals.calories : 0
  const protein = status === 'ready' ? totals.protein : 0
  const steps = statsStatus === 'ready' ? dailyStats.steps : 0
  const waterMl = statsStatus === 'ready' ? dailyStats.waterMl : 0
  const waterLitres = waterMl / 1000
  const waterLabel = Number.isInteger(waterLitres)
    ? String(waterLitres)
    : String(Math.round(waterLitres * 100) / 100)

  async function saveSteps(event) {
    event.preventDefault()
    setSavingSteps(true)
    setStatsError('')

    try {
      const stats = await api.saveDailyStats({
        dateKey: selectedDate,
        steps: Number(stepsInput)
      })
      setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
      setStepsInput(String(stats.steps || 0))
    } catch (saveError) {
      setStatsError(saveError.message)
    } finally {
      setSavingSteps(false)
    }
  }

  async function saveWater(event) {
    event.preventDefault()
    setSavingWater(true)
    setStatsError('')

    try {
      const stats = await api.saveDailyStats({
        dateKey: selectedDate,
        waterMl: Number(waterInput)
      })
      setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
      setWaterInput(String(stats.waterMl || 0))
    } catch (saveError) {
      setStatsError(saveError.message)
    } finally {
      setSavingWater(false)
    }
  }

  async function addWater(waterDeltaMl) {
    setSavingWater(true)
    setStatsError('')

    try {
      const stats = await api.saveDailyStats({
        dateKey: selectedDate,
        waterDeltaMl
      })
      setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
      setWaterInput(String(stats.waterMl || 0))
    } catch (saveError) {
      setStatsError(saveError.message)
    } finally {
      setSavingWater(false)
    }
  }

  async function saveBurned(event) {
    event.preventDefault()
    setSavingBurned(true)
    setStatsError('')

    try {
      const stats = await api.saveDailyStats({
        dateKey: selectedDate,
        caloriesBurned: Number(burnedInput)
      })
      setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
      setBurnedInput(String(stats.caloriesBurned || 0))
    } catch (saveError) {
      setStatsError(saveError.message)
    } finally {
      setSavingBurned(false)
    }
  }

  async function useSuggestedBurn() {
    setBurnedInput(String(suggestedBurn))
    setSavingBurned(true)
    setStatsError('')

    try {
      const stats = await api.saveDailyStats({ dateKey: selectedDate, caloriesBurned: suggestedBurn })
      setDailyStats({ steps: stats.steps || 0, waterMl: stats.waterMl || 0, caloriesBurned: stats.caloriesBurned || 0 })
    } catch (saveError) {
      setStatsError(saveError.message)
    } finally {
      setSavingBurned(false)
    }
  }

  const workoutCompleted = Boolean(workoutState?.completed)
  const cardioCompleted = Boolean(workoutState?.completion?.cardioCompleted)
  const caloriesBurned = statsStatus === 'ready' ? dailyStats.caloriesBurned : 0

  const weightProgressPercent = (() => {
    if (currentWeightKg == null || targetWeightKg == null || startWeightKg == null) {
      return null
    }

    const totalToChange = targetWeightKg - startWeightKg

    if (totalToChange === 0) {
      return 100
    }

    const changedSoFar = currentWeightKg - startWeightKg
    return Math.min(100, Math.max(0, Math.round((changedSoFar / totalToChange) * 100)))
  })()

  const cards = [
    { title: 'Calories', value: `${calories} / 1300 kcal`, target: '1300 kcal', icon: Flame, tone: 'pink' },
    { title: 'Protein', value: `${protein} / 70 g`, target: '70 g', icon: Utensils, tone: 'navy' },
    {
      title: 'Workout',
      value: workoutCompleted ? 'Completed' : 'Not Completed',
      target: 'Monday - Saturday',
      icon: ShieldCheck,
      tone: 'navy'
    },
    {
      title: 'Cardio',
      value: cardioCompleted ? 'Completed' : 'Not Completed',
      target: '30 minutes daily',
      icon: HeartPulse,
      tone: 'pink'
    }
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="flex items-center gap-4">
            <img src="/myfit.png" alt="MyFit logo" className="h-16 w-16 rounded-2xl object-contain" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-normal text-navy md:text-4xl">MyFit</h1>
              <p className="mt-1 text-base font-semibold text-slate-500">
                Your Daily Fitness Journey
              </p>
            </div>
          </div>
        </div>
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
          {formatToday()}
        </p>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Dashboard Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
      </section>

      <ProteinSection
        calories={calories}
        protein={protein}
        waterMl={waterMl}
        workoutCompleted={workoutCompleted}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard {...cards[0]} />
        <StatCard {...cards[1]} />
        <DailyTrackingCard
          title="Water"
          value={waterMl}
          target={4000}
          valueLabel={`${waterLabel} L`}
          targetLabel="4 L"
          icon={Droplets}
          tone="blue"
          completed={waterMl >= 4000}
          completedLabel="Water Goal Completed"
        >
          <div className="flex flex-wrap gap-2">
            {[250, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={savingWater || waterMl >= 4000}
                onClick={() => addWater(amount)}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                +{amount === 1000 ? '1 L' : `${amount} ml`}
              </button>
            ))}
          </div>
          <form onSubmit={saveWater} className="mt-3 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600" htmlFor="water-input">
              Edit water in ml
            </label>
            <div className="flex gap-2">
              <input
                id="water-input"
                type="number"
                min="0"
                step="50"
                value={waterInput}
                onChange={(event) => setWaterInput(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={savingWater}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Save
              </button>
            </div>
          </form>
        </DailyTrackingCard>
        <DailyTrackingCard
          title="Steps"
          value={steps}
          target={5000}
          valueLabel={String(steps)}
          targetLabel="5000"
          icon={Footprints}
          tone="green"
          completed={steps >= 5000}
          completedLabel="5K Steps Completed"
        >
          <form onSubmit={saveSteps} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600" htmlFor="steps-input">
              Enter Steps
            </label>
            <div className="flex gap-2">
              <input
                id="steps-input"
                type="number"
                min="0"
                step="1"
                value={stepsInput}
                onChange={(event) => setStepsInput(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={savingSteps}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Save Steps
              </button>
            </div>
          </form>
        </DailyTrackingCard>
        <StatCard {...cards[2]} />
        <StatCard {...cards[3]} />
        <DailyTrackingCard
          title="Calories Burned"
          value={caloriesBurned}
          target={Math.max(suggestedBurn, 1)}
          valueLabel={`${caloriesBurned} kcal`}
          targetLabel={`${suggestedBurn} kcal est.`}
          icon={Flame}
          tone="green"
          completed={suggestedBurn > 0 && caloriesBurned >= suggestedBurn}
          completedLabel="Estimated Burn Reached"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingBurned || suggestedBurn === 0}
              onClick={useSuggestedBurn}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Use Suggested ({suggestedBurn} kcal)
            </button>
          </div>
          <form onSubmit={saveBurned} className="mt-3 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600" htmlFor="burned-input">
              Edit calories burned
            </label>
            <div className="flex gap-2">
              <input
                id="burned-input"
                type="number"
                min="0"
                step="10"
                value={burnedInput}
                onChange={(event) => setBurnedInput(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={savingBurned}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Save
              </button>
            </div>
          </form>
        </DailyTrackingCard>
      </section>

      {status === 'error' && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dashboard diet totals are unavailable because the backend or MongoDB connection is not ready.
        </p>
      )}
      {statsError && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {statsError}
        </p>
      )}

      <MotivationCard />

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <ProgressCard />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              title="Current Weight"
              value={currentWeightKg != null ? `${currentWeightKg} kg` : '-- kg'}
              detail={`Goal Weight: ${targetWeightKg != null ? `${targetWeightKg} kg` : '-- kg'}`}
              icon={Weight}
              tone="blue"
            />
            <StatCard
              title="Weight Progress"
              value={weightProgressPercent != null ? `${weightProgressPercent}%` : '--%'}
              detail="Toward your goal weight"
              icon={Flame}
              tone="pink"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard title="Current Streak" value="0 Days" icon={Flame} tone="pink" />
            <StatCard title="Coins" value={String(totalCoins)} icon={HandCoins} tone="green" />
          </div>
        </div>
        <WorkoutPreview onStatusChange={setWorkoutState} />
      </section>

      <TodaysChallengesCard />

      <FutureSelfSection />
    </div>
  )
}
