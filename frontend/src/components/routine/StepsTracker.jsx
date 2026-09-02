import { Footprints } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../lib/api.js'

const MIN_TARGET = 5000
const IDEAL_TARGET = 10000

export default function StepsTracker({ dateKey, steps, onUpdate }) {
  const [manualInput, setManualInput] = useState(String(steps))
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const percent = Math.min(100, Math.round((steps / IDEAL_TARGET) * 100))
  const minGoalReached = steps >= MIN_TARGET
  const idealGoalReached = steps >= IDEAL_TARGET

  async function handleSave(event) {
    event.preventDefault()
    const stepsValue = Number(manualInput)

    if (!Number.isFinite(stepsValue) || stepsValue < 0) {
      setError('Enter a valid step count')
      return
    }

    setSaving(true)
    setError('')

    try {
      const stats = await api.saveDailyStats({ dateKey, steps: stepsValue })
      setManualInput(String(stats.steps || 0))
      onUpdate(stats)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Daily Steps</p>
          <p className="mt-2 text-2xl font-extrabold text-navy">
            {steps.toLocaleString()} <span className="text-base font-bold text-slate-400">/ {IDEAL_TARGET.toLocaleString()} steps</span>
          </p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Footprints className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold">
        <span
          className={`rounded-full px-3 py-1 ${
            minGoalReached ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {minGoalReached ? '✅' : `${MIN_TARGET.toLocaleString()} min`} Minimum Goal
        </span>
        <span
          className={`rounded-full px-3 py-1 ${
            idealGoalReached ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {idealGoalReached ? '✅' : `${IDEAL_TARGET.toLocaleString()} ideal`} Daily Goal
        </span>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-600" htmlFor={`steps-input-${dateKey}`}>
          Update today's steps
        </label>
        <div className="flex gap-2">
          <input
            id={`steps-input-${dateKey}`}
            type="number"
            min="0"
            step="1"
            value={manualInput}
            onChange={(event) => setManualInput(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? 'Saving...' : 'Save Steps'}
          </button>
        </div>
      </form>
    </article>
  )
}
