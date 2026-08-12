import { CheckCircle2, Coins } from 'lucide-react'

export default function ChallengeCard({ challenge }) {
  const { name, description, category, unit, target, progress, percent, completed, coinReward } = challenge

  return (
    <article className={`dashboard-card p-5 ${completed ? 'border-emerald-200 bg-emerald-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
            {category}
          </span>
          <h3 className="mt-2 text-lg font-extrabold text-navy">{name}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-700">
          <Coins className="h-4 w-4" aria-hidden="true" />
          {coinReward}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-bold text-slate-600">
          <span>
            {progress} / {target} {unit}
          </span>
          <span className="text-navy">{percent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-accent'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        {completed ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            In Progress
          </span>
        )}
      </div>
    </article>
  )
}
