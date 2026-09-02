import { Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '../common/StatusState.jsx'

const CATEGORY_TONES = {
  Food: 'bg-amber-50 text-amber-700',
  Drink: 'bg-blue-50 text-blue-700',
  Workout: 'bg-emerald-50 text-emerald-700',
  Water: 'bg-cyan-50 text-cyan-700',
  Other: 'bg-slate-100 text-slate-600'
}

function describeItem(item) {
  if (item.category === 'Food' || item.category === 'Drink') {
    const parts = [item.quantity, item.mealType].filter(Boolean)
    const macros = []
    if (item.calories) macros.push(`${item.calories} kcal`)
    if (item.protein) macros.push(`${item.protein} g protein`)
    return [parts.join(' · '), macros.join(' | ')].filter(Boolean).join(' — ')
  }

  if (item.category === 'Workout') {
    const parts = [item.duration, item.caloriesBurned ? `${item.caloriesBurned} kcal burned` : null].filter(Boolean)
    return parts.join(' — ')
  }

  if (item.category === 'Water') {
    return `${item.waterMl} ml`
  }

  return ''
}

export default function ExtraItemsSection({ extraItems, onAddClick, onEditClick, onDeleteClick, deletingId }) {
  return (
    <section className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Extra Today</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Anything you did outside the planned routine above.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Extra
        </button>
      </div>

      {extraItems.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="Nothing extra logged" message="Anything outside your planned routine will show up here." />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {extraItems.map((item) => (
            <li
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${CATEGORY_TONES[item.category] || CATEGORY_TONES.Other}`}
                  >
                    {item.category}
                  </span>
                  <p className="truncate text-base font-extrabold text-navy">{item.name}</p>
                </div>
                {describeItem(item) && (
                  <p className="mt-1 text-sm font-semibold text-slate-500">{describeItem(item)}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEditClick(item)}
                  disabled={deletingId === item._id}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  aria-label={`Edit ${item.name}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick(item)}
                  disabled={deletingId === item._id}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
