import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import WeightChart from '../components/weight/WeightChart.jsx'
import WeightEntryForm from '../components/weight/WeightEntryForm.jsx'
import WeightGoalCard from '../components/weight/WeightGoalCard.jsx'
import WeightHistoryList from '../components/weight/WeightHistoryList.jsx'
import { api, getTodayKey } from '../lib/api.js'

export default function Weight() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [entryWeightKg, setEntryWeightKg] = useState(null)
  const [latestWeightKg, setLatestWeightKg] = useState(null)
  const [targetWeightKg, setTargetWeightKg] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isSavingGoal, setSavingGoal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadHistoryAndGoal() {
    const [latest, goal, historyResult] = await Promise.all([
      api.getLatestWeight(),
      api.getWeightGoal(),
      api.getWeightHistory()
    ])

    setLatestWeightKg(latest.entry?.weightKg ?? null)
    setTargetWeightKg(goal.targetWeightKg ?? null)
    setHistory(historyResult.entries || [])
  }

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      setLoading(true)
      setError('')

      try {
        const [dateEntry] = await Promise.all([api.getWeightEntry(selectedDate), loadHistoryAndGoal()])

        if (isMounted) {
          setEntryWeightKg(dateEntry.entry?.weightKg ?? null)
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

  async function saveWeight(weightInput) {
    setSaving(true)
    setError('')
    setSuccessMessage('')

    const weightKg = Number(weightInput)

    if (!weightInput || !Number.isFinite(weightKg) || weightKg <= 0) {
      setError('Enter a valid weight greater than 0.')
      setSaving(false)
      return
    }

    try {
      const result = await api.saveWeight({ dateKey: selectedDate, weightKg })
      setEntryWeightKg(result.entry?.weightKg ?? null)
      setSuccessMessage(`Saved ${result.entry?.weightKg} kg for ${selectedDate}.`)
      await loadHistoryAndGoal()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveGoal(targetInput) {
    setSavingGoal(true)
    setError('')

    const target = Number(targetInput)

    if (!targetInput || !Number.isFinite(target) || target <= 0) {
      setError('Enter a valid target weight greater than 0.')
      setSavingGoal(false)
      return false
    }

    try {
      const result = await api.saveWeightGoal(target)
      setTargetWeightKg(result.targetWeightKg ?? null)
      return true
    } catch (goalError) {
      setError(goalError.message)
      return false
    } finally {
      setSavingGoal(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading Weight..." />
  }

  const chartEntries = [...history].reverse()
  const startWeightKg = chartEntries[0]?.weightKg ?? null

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Weight</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">⚖️ Weight Tracker</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Log your weight, track progress toward your goal, and see your trend over time.
          </p>
        </div>
      </section>

      {error && <ErrorState message={error} />}
      {successMessage && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </p>
      )}

      <WeightEntryForm
        dateKey={selectedDate}
        weightKg={entryWeightKg}
        onDateChange={setSelectedDate}
        onSave={saveWeight}
        isSaving={isSaving}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightGoalCard
          currentWeightKg={latestWeightKg}
          targetWeightKg={targetWeightKg}
          startWeightKg={startWeightKg}
          onSaveGoal={saveGoal}
          isSavingGoal={isSavingGoal}
        />

        <section className="dashboard-card p-5">
          <h2 className="text-lg font-extrabold text-navy">Weight Progress</h2>
          <div className="mt-4">
            <WeightChart entries={chartEntries} />
          </div>
        </section>
      </div>

      <section className="dashboard-card p-5">
        <h2 className="text-lg font-extrabold text-navy">Weight History</h2>
        <div className="mt-4">
          <WeightHistoryList entries={history} />
        </div>
      </section>
    </div>
  )
}
