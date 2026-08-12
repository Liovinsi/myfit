import { Trophy } from 'lucide-react'

export default function BestStatsSection({ stats }) {
  if (!stats || stats.length === 0) {
    return null
  }

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Best Stats</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <p className="text-sm font-extrabold">{stat.label}</p>
            </div>
            <p className="mt-2 text-lg font-extrabold text-navy">{stat.value}</p>
            {stat.detail && <p className="mt-1 text-xs font-semibold text-slate-500">{stat.detail}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
