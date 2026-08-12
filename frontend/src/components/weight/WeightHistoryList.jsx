import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

function formatDiff(diff) {
  if (diff == null) {
    return null
  }

  const rounded = Math.round(diff * 10) / 10

  if (rounded === 0) {
    return { label: '0.0 kg', tone: 'text-slate-500', Icon: Minus }
  }

  if (rounded > 0) {
    return { label: `+${rounded.toFixed(1)} kg`, tone: 'text-rose-600', Icon: TrendingUp }
  }

  return { label: `${rounded.toFixed(1)} kg`, tone: 'text-emerald-600', Icon: TrendingDown }
}

export default function WeightHistoryList({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm font-semibold text-slate-500">No weight entries yet. Log your first weight above.</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {entries.map((entry, index) => {
        const previousEntry = entries[index + 1]
        const diff = previousEntry ? entry.weightKg - previousEntry.weightKg : null
        const diffInfo = formatDiff(diff)
        const isLatest = index === 0

        return (
          <li
            key={entry.dateKey}
            className={`flex items-center justify-between gap-4 rounded-xl py-3 ${isLatest ? 'bg-pink-50 px-3' : 'px-3'}`}
          >
            <div>
              <p className={`text-sm font-bold ${isLatest ? 'text-accent' : 'text-slate-500'}`}>
                {entry.dateKey}
                {isLatest && ' · Latest'}
              </p>
              <p className="mt-1 text-xl font-extrabold text-navy">{entry.weightKg} kg</p>
            </div>
            {diffInfo && (
              <span className={`inline-flex items-center gap-1 text-sm font-extrabold ${diffInfo.tone}`}>
                <diffInfo.Icon className="h-4 w-4" aria-hidden="true" />
                {diffInfo.label}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
