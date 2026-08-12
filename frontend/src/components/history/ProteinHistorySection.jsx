export default function ProteinHistorySection({ entries }) {
  const proteinEntries = entries.filter((entry) => entry.foodSnapshot.category === 'Protein')

  if (proteinEntries.length === 0) {
    return (
      <section className="dashboard-card p-5">
        <h2 className="text-lg font-extrabold text-navy">Protein History</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">No protein foods logged for this date.</p>
      </section>
    )
  }

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Protein History</h2>
      <div className="mt-4 space-y-2">
        {proteinEntries.map((entry) => (
          <div key={entry._id} className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3">
            <div>
              <p className="text-sm font-extrabold text-navy">{entry.foodSnapshot.name}</p>
              <p className="text-xs font-semibold text-slate-500">
                {entry.quantity.amount} {entry.quantity.unit}
              </p>
            </div>
            <div className="text-right text-xs font-semibold text-slate-500">
              <p>{entry.nutrition.calories} kcal</p>
              <p>{entry.nutrition.protein} g protein</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
