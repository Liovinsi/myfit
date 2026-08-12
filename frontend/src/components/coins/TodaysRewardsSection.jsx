const REWARD_ICONS = {
  workout: '🏋️',
  steps: '👣',
  water: '💧',
  challenge: '🏆'
}

export default function TodaysRewardsSection({ transactions }) {
  const total = transactions.reduce((sum, transaction) => sum + transaction.coins, 0)

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Today's Rewards</h2>

      {transactions.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-slate-500">No rewards earned yet today. Keep going!</p>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3"
              >
                <span className="text-sm font-bold text-navy">
                  {REWARD_ICONS[transaction.rewardType] || '🪙'} {transaction.description}
                </span>
                <span className="text-sm font-extrabold text-amber-700">+{transaction.coins}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-extrabold text-navy">Today's Total</span>
            <span className="text-sm font-extrabold text-accent">+{total} Coins</span>
          </div>
        </>
      )}
    </section>
  )
}
