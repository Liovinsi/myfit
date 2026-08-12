import { Minus, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '../common/StatusState.jsx'

const meals = ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner']

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export default function TodaysDiet({ diet, onQuantityChange, onRemove, updatingId }) {
  const hasEntries = diet.entries?.length > 0

  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Today's Diet</p>
          <h2 className="mt-2 text-2xl font-extrabold text-navy">
            {formatNumber(diet.totals?.calories || 0)} kcal | P {formatNumber(diet.totals?.protein || 0)} g | F{' '}
            {formatNumber(diet.totals?.fiber || 0)} g
          </h2>
        </div>
      </div>

      {!hasEntries && (
        <div className="mt-5">
          <EmptyState title="No foods added today" message="Tick foods from My Regular Foods and add them to a meal." />
        </div>
      )}

      {hasEntries && (
        <div className="mt-5 space-y-6">
          {meals.map((meal) => {
            const entries = diet.meals?.[meal] || []

            if (entries.length === 0) {
              return null
            }

            return (
              <div key={meal}>
                <h3 className="text-base font-extrabold text-navy">{meal}</h3>
                <div className="mt-3 space-y-3">
                  {entries.map((entry) => {
                    const step = Math.max(1, entry.foodSnapshot.defaultQuantity.amount / 2)
                    const nextMinus = Math.max(step, entry.quantity.amount - step)
                    const nextPlus = entry.quantity.amount + step

                    return (
                      <article key={entry._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-base font-extrabold text-navy">☑ {entry.foodSnapshot.name}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {formatNumber(entry.quantity.amount)} {entry.quantity.unit}
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {formatNumber(entry.nutrition.calories)} kcal | P {formatNumber(entry.nutrition.protein)} g
                              | F {formatNumber(entry.nutrition.fiber)} g
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(entry._id, nextMinus)}
                              disabled={updatingId === entry._id}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                              aria-label={`Decrease ${entry.foodSnapshot.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-24 rounded-xl bg-white px-3 py-2 text-center text-sm font-extrabold text-slate-700">
                              {formatNumber(entry.quantity.amount)} {entry.quantity.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantityChange(entry._id, nextPlus)}
                              disabled={updatingId === entry._id}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                              aria-label={`Increase ${entry.foodSnapshot.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(entry._id)}
                              disabled={updatingId === entry._id}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
