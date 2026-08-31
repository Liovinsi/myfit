import { Link } from 'react-router-dom'
import ProgressRing from '../progress/ProgressRing.jsx'

export const PROTEIN_TARGET_G = 70

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-extrabold text-navy">{value}</p>
    </div>
  )
}

export default function ProteinSection({ calories, protein, waterMl, workoutCompleted }) {
  const remaining = Math.max(0, Math.round((PROTEIN_TARGET_G - protein) * 10) / 10)
  const waterLitres = Math.round((waterMl / 1000) * 10) / 10

  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <ProgressRing
            value={protein}
            target={PROTEIN_TARGET_G}
            tone="emerald"
            label="Protein"
            valueLabel={`${protein} / ${PROTEIN_TARGET_G} g`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Protein Tracker</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy">{protein} g consumed today</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Target {PROTEIN_TARGET_G} g &middot; Remaining {remaining} g
              </p>
            </div>
            <Link
              to="/protein"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
            >
              Manage Protein Foods
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="Calories" value={`${calories} kcal`} />
            <SummaryStat label="Protein" value={`${protein} g`} />
            <SummaryStat label="Water" value={`${waterLitres} L`} />
            <SummaryStat label="Workout" value={workoutCompleted ? 'Done' : 'Pending'} />
          </div>
        </div>
      </div>
    </section>
  )
}
