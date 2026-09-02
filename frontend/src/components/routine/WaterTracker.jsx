import { Droplets } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../lib/api.js'

const WATER_TARGET_ML = 3000
const QUICK_ADD_AMOUNTS = [250, 500, 1000]

export default function WaterTracker({ dateKey, waterMl, onUpdate }) {
  const [manualInput, setManualInput] = useState(String(waterMl))
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const percent = Math.min(100, Math.round((waterMl / WATER_TARGET_ML) * 100))
  const remainingMl = Math.max(0, WATER_TARGET_ML - waterMl)

  async function persist(payload) {
    setSaving(true)
    setError('')

    try {
      const stats = await api.saveDailyStats({ dateKey, ...payload })
      setManualInput(String(stats.waterMl || 0))
      onUpdate(stats)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  function handleManualSave(event) {
    event.preventDefault()
    const waterMlValue = Number(manualInput)

    if (!Number.isFinite(waterMlValue) || waterMlValue < 0) {
      setError('Enter a valid amount in ml')
      return
    }

    persist({ waterMl: waterMlValue })
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Daily Water</p>
          <p className="mt-2 text-2xl font-extrabold text-navy">
            {waterMl} ml <span className="text-base font-bold text-slate-400">/ {WATER_TARGET_ML} ml</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{remainingMl} ml remaining</p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Droplets className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs font-bold text-blue-700">{percent}% of daily target</p>

      {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_ADD_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={isSaving}
            onClick={() => persist({ waterDeltaMl: amount })}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            +{amount === 1000 ? '1 L' : `${amount} ml`}
          </button>
        ))}
      </div>

      <form onSubmit={handleManualSave} className="mt-3 flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-600" htmlFor={`water-input-${dateKey}`}>
          Correct today's total (ml)
        </label>
        <div className="flex gap-2">
          <input
            id={`water-input-${dateKey}`}
            type="number"
            min="0"
            step="50"
            value={manualInput}
            onChange={(event) => setManualInput(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </article>
  )
}
