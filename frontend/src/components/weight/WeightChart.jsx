export default function WeightChart({ entries }) {
  if (!entries || entries.length < 2) {
    return (
      <p className="text-sm font-semibold text-slate-500">
        Log at least two weight entries to see your progress chart.
      </p>
    )
  }

  const width = 600
  const height = 180
  const paddingX = 12
  const paddingY = 16

  const weights = entries.map((entry) => entry.weightKg)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const range = maxWeight - minWeight || 1

  const points = entries.map((entry, index) => {
    const x = paddingX + (index / (entries.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - ((entry.weightKg - minWeight) / range) * (height - paddingY * 2)
    return { x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-40 w-full"
      role="img"
      aria-label="Weight progress chart"
    >
      <line
        x1={paddingX}
        y1={height - paddingY}
        x2={width - paddingX}
        y2={height - paddingY}
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <path d={linePath} fill="none" className="text-accent" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <circle
          key={entries[index].dateKey}
          cx={point.x}
          cy={point.y}
          r={index === points.length - 1 ? 5 : 3}
          className={index === points.length - 1 ? 'text-accent' : 'text-navy'}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
