import { Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function WeightGoalCard({
  currentWeightKg,
  targetWeightKg,
  startWeightKg,
  onSaveGoal,
  isSavingGoal
}) {
  const [targetInput, setTargetInput] = useState(targetWeightKg != null ? String(targetWeightKg) : '')
  const [isEditing, setIsEditing] = useState(false)

  const hasCurrent = currentWeightKg != null
  const hasTarget = targetWeightKg != null
  const remainingKg = hasCurrent && hasTarget ? Math.abs(currentWeightKg - targetWeightKg) : null
  const direction = hasCurrent && hasTarget
    ? currentWeightKg > targetWeightKg
      ? 'lose'
      : currentWeightKg < targetWeightKg
        ? 'gain'
        : 'reached'
    : null

  const progressPercent = (() => {
    if (!hasCurrent || !hasTarget || startWeightKg == null) {
      return null
    }

    const totalToChange = targetWeightKg - startWeightKg

    if (totalToChange === 0) {
      return 100
    }

    const changedSoFar = currentWeightKg - startWeightKg
    return Math.min(100, Math.max(0, Math.round((changedSoFar / totalToChange) * 100)))
  })()

  async function handleSubmit(event) {
    event.preventDefault()
    const success = await onSaveGoal(targetInput)

    if (success) {
      setIsEditing(false)
    }
  }

  return (
    <section className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy">Goal</h2>
        <button
          type="button"
          onClick={() => {
            setTargetInput(targetWeightKg != null ? String(targetWeightKg) : '')
            setIsEditing((current) => !current)
          }}
          className="text-sm font-bold text-slate-500 hover:text-navy"
        >
          {isEditing ? 'Cancel' : hasTarget ? 'Edit Target' : 'Set Target'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-2 text-sm font-bold text-slate-700">
            Target Weight (kg)
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              value={targetInput}
              onChange={(event) => setTargetInput(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={isSavingGoal}
            className="rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSavingGoal ? 'Saving...' : 'Save Target'}
          </button>
        </form>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-500">Current Weight</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{hasCurrent ? `${currentWeightKg} kg` : '-- kg'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Target Weight</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{hasTarget ? `${targetWeightKg} kg` : '-- kg'}</p>
          </div>
        </div>
      )}

      {remainingKg != null && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            {direction === 'lose' && <TrendingDown className="h-5 w-5 text-accent" aria-hidden="true" />}
            {direction === 'gain' && <TrendingUp className="h-5 w-5 text-accent" aria-hidden="true" />}
            {direction === 'reached' && <Target className="h-5 w-5 text-emerald-600" aria-hidden="true" />}
            <p className="text-sm font-extrabold text-navy">
              {direction === 'reached' ? 'Goal reached!' : `${remainingKg.toFixed(1)} kg to ${direction}`}
            </p>
          </div>

          {progressPercent != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                <span>Progress to Goal</span>
                <span className="text-navy">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
