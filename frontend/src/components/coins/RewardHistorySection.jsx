const REWARD_ICONS = {
  workout: '🏋️',
  steps: '👣',
  water: '💧',
  challenge: '🏆'
}

function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function RewardHistorySection({ historyByDate, historyDates }) {
  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Reward History</h2>

      {historyDates.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-slate-500">No past rewards yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {historyDates.map((dateKey) => {
            const items = historyByDate[dateKey]
            const total = items.reduce((sum, transaction) => sum + transaction.coins, 0)

            return (
              <div key={dateKey} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-navy">{formatDisplayDate(dateKey)}</p>
                  <p className="text-sm font-extrabold text-accent">Total: +{total}</p>
                </div>
                <div className="mt-2 space-y-1">
                  {items.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-600">
                        {REWARD_ICONS[transaction.rewardType] || '🪙'} {transaction.description}
                      </span>
                      <span className="font-extrabold text-slate-500">+{transaction.coins}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
