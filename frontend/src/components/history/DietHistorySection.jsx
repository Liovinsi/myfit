const MEALS = ['Breakfast', 'Lunch', 'Mid Lunch', 'Evening Snack', 'Dinner']

export default function DietHistorySection({ meals, totals }) {
  const hasAnyEntries = MEALS.some((meal) => (meals[meal] || []).length > 0)

  if (!hasAnyEntries) {
    return (
      <section className="dashboard-card p-5">
        <h2 className="text-lg font-extrabold text-navy">Diet History</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">No foods logged for this date.</p>
      </section>
    )
  }

  return (
    <section className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy">Diet History</h2>
        <p className="text-sm font-bold text-slate-600">
          {totals.calories} kcal · {totals.protein} g protein
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {MEALS.map((meal) => {
          const entries = meals[meal] || []

          if (entries.length === 0) {
            return null
          }

          return (
            <div key={meal}>
              <p className="text-xs font-extrabold uppercase tracking-wide text-accent">{meal}</p>
              <div className="mt-2 space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-extrabold text-navy">{entry.foodSnapshot.name}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {entry.quantity.amount} {entry.quantity.unit}
                      </p>
                    </div>
                    <div className="text-right text-xs font-semibold text-slate-500">
                      <p>{entry.nutrition.calories} kcal</p>
                      <p>{entry.nutrition.protein} g protein</p>
                      <p>{entry.nutrition.fiber} g fiber</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
