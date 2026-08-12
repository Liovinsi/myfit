const meals = ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner']

export default function MealSelector({ selectedMeal, onMealChange, onConfirm, onCancel, isAdding }) {
  return (
    <section className="dashboard-card p-5">
      <label className="block space-y-2 text-sm font-bold text-slate-700">
        Which meal?
        <select
          required
          value={selectedMeal}
          onChange={(event) => onMealChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-3 font-semibold outline-none focus:border-accent sm:max-w-sm"
        >
          <option value="">Select meal</option>
          {meals.map((meal) => (
            <option key={meal} value={meal}>
              {meal}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedMeal || isAdding}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isAdding ? 'Adding...' : "Add to Today's Diet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </section>
  )
}
