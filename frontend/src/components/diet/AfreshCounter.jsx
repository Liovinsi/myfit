import { Minus, Plus } from 'lucide-react'

export default function AfreshCounter({ count, onChange, isSaving }) {
  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Afresh</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Tap + each time you drink Afresh today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(-1)}
            disabled={isSaving || count <= 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Decrease Afresh count"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-14 text-center text-2xl font-extrabold text-navy">{count}</span>
          <button
            type="button"
            onClick={() => onChange(1)}
            disabled={isSaving}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Increase Afresh count"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
