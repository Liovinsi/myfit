function formatShortDate(dateKey) {
  const parts = String(dateKey || '').split('-')
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : dateKey
}

export default function WeeklySummarySection({ days, weightByDate }) {
  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Weekly Summary</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Last 7 days</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => {
          const weightKg = weightByDate[day.dateKey]

          return (
            <div key={day.dateKey} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                {formatShortDate(day.dateKey)}
              </p>
              <p className="mt-2 text-sm font-extrabold text-navy">{weightKg != null ? `${weightKg} kg` : '—'}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{day.calories} kcal</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{day.protein} g protein</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{(day.waterMl / 1000).toFixed(1)} L</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{day.steps} steps</p>
              <span
                className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-extrabold ${
                  day.restDay
                    ? 'bg-slate-200 text-slate-600'
                    : day.workoutCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-50 text-rose-600'
                }`}
              >
                {day.restDay ? 'Rest' : day.workoutCompleted ? 'Workout Done' : 'Missed'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
