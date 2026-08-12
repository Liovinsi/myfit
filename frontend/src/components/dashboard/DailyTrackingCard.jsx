function ProgressBar({ value, target, tone = 'bg-emerald-500' }) {
  const progress = Math.min((value / target) * 100, 100)

  return (
    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${progress}%` }} />
    </div>
  )
}

export default function DailyTrackingCard({
  title,
  value,
  target,
  valueLabel,
  targetLabel,
  icon: Icon,
  tone = 'green',
  completed,
  completedLabel = 'Goal Completed',
  children
}) {
  const tones = {
    green: {
      icon: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-500'
    },
    blue: {
      icon: 'bg-blue-50 text-blue-700',
      bar: 'bg-blue-500'
    }
  }
  const selectedTone = tones[tone] || tones.green

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-normal text-navy">
            {valueLabel} / {targetLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">Target: {targetLabel}</p>
        </div>
        {Icon && (
          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selectedTone.icon}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      <ProgressBar value={value} target={target} tone={selectedTone.bar} />

      {completed && (
        <p className="mt-3 text-sm font-extrabold text-emerald-700">✅ {completedLabel}</p>
      )}

      <div className="mt-4">{children}</div>
    </article>
  )
}
