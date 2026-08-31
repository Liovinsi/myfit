import { Pencil, Plus, Trash2 } from 'lucide-react'

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export default function FoodCard({
  food,
  checked,
  alreadyAdded,
  onToggle,
  onEdit,
  onDelete,
  onQuickAdd
}) {
  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(food._id)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-accent focus:ring-accent"
          aria-label={`Select ${food.name}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-navy">{food.name}</h3>
            {alreadyAdded && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                Already added today
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {formatNumber(food.defaultQuantity.amount)} {food.defaultQuantity.unit}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-700">
            {formatNumber(food.nutrition.calories)} kcal
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Protein {formatNumber(food.nutrition.protein)} g | Fiber {formatNumber(food.nutrition.fiber)} g
          </p>
          {(food.nutrition.carbs > 0 || food.nutrition.fat > 0) && (
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Carbs {formatNumber(food.nutrition.carbs || 0)} g | Fat {formatNumber(food.nutrition.fat || 0)} g
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(food)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onQuickAdd(food._id)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />
          Add to Today's Diet
        </button>
        <button
          type="button"
          onClick={() => onDelete(food._id)}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </article>
  )
}
