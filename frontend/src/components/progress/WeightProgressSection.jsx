import WeightChart from '../weight/WeightChart.jsx'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-extrabold text-navy">{value}</p>
    </div>
  )
}

export default function WeightProgressSection({ history, latestWeightKg, targetWeightKg, chartEntries }) {
  const startingWeightKg = history.length > 0 ? history[history.length - 1].weightKg : null
  const currentWeightKg = latestWeightKg
  const hasTarget = targetWeightKg != null

  const totalChangeKg = startingWeightKg != null && currentWeightKg != null
    ? Math.round((startingWeightKg - currentWeightKg) * 10) / 10
    : null

  const changeLabel = totalChangeKg == null
    ? 'Total Change'
    : totalChangeKg > 0
      ? 'Total Weight Lost'
      : totalChangeKg < 0
        ? 'Total Weight Gained'
        : 'Total Weight Change'
  const changeValue = totalChangeKg == null ? '--' : `${Math.abs(totalChangeKg).toFixed(1)} kg`

  const remainingKg = hasTarget && currentWeightKg != null ? Math.abs(currentWeightKg - targetWeightKg) : null

  const progressPercent = (() => {
    if (startingWeightKg == null || currentWeightKg == null || !hasTarget) {
      return null
    }

    const totalToChange = targetWeightKg - startingWeightKg

    if (totalToChange === 0) {
      return 100
    }

    const changedSoFar = currentWeightKg - startingWeightKg
    return Math.min(100, Math.max(0, Math.round((changedSoFar / totalToChange) * 100)))
  })()

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Weight Progress</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Starting Weight" value={startingWeightKg != null ? `${startingWeightKg} kg` : '-- kg'} />
        <Stat label="Current Weight" value={currentWeightKg != null ? `${currentWeightKg} kg` : '-- kg'} />
        <Stat label="Target Weight" value={hasTarget ? `${targetWeightKg} kg` : '-- kg'} />
        <Stat label={changeLabel} value={changeValue} />
        <Stat label="Remaining" value={remainingKg != null ? `${remainingKg.toFixed(1)} kg` : '--'} />
        <Stat label="Progress" value={progressPercent != null ? `${progressPercent}%` : '--'} />
      </div>

      <div className="mt-5">
        <WeightChart entries={chartEntries} />
      </div>
    </section>
  )
}
