import { useEffect, useState } from 'react'

export default function WeightEntryForm({ dateKey, weightKg, onDateChange, onSave, isSaving }) {
  const [weightInput, setWeightInput] = useState(weightKg != null ? String(weightKg) : '')

  useEffect(() => {
    setWeightInput(weightKg != null ? String(weightKg) : '')
  }, [dateKey, weightKg])

  function handleSubmit(event) {
    event.preventDefault()
    onSave(weightInput)
  }

  return (
    <form className="dashboard-card p-5" onSubmit={handleSubmit}>
      <h2 className="text-lg font-extrabold text-navy">Log Weight</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Date
          <input
            type="date"
            value={dateKey}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-700">
          Weight (kg)
          <input
            required
            type="number"
            step="0.1"
            min="0.1"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? 'Saving...' : 'Save Weight'}
        </button>
      </div>
    </form>
  )
}
