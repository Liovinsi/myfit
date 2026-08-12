const ranges = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '3m', label: '3 Months' },
  { key: 'all', label: 'All Time' }
]

export default function ProgressRangeSelector({ value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
      {ranges.map((range) => (
        <button
          key={range.key}
          type="button"
          onClick={() => onChange(range.key)}
          className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
            value === range.key ? 'bg-navy text-white shadow-sm' : 'text-slate-600 hover:bg-white'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
