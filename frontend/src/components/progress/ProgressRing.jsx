const TONE_COLORS = {
  accent: 'text-accent',
  emerald: 'text-emerald-500',
  blue: 'text-blue-500'
}

export default function ProgressRing({ value, target, label, valueLabel, tone = 'accent', size = 96 }) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0
  const strokeWidth = 8
  const radius = size / 2 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className={TONE_COLORS[tone] || TONE_COLORS.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-navy">{percent}%</span>
        </div>
      </div>
      <p className="text-sm font-extrabold text-navy">{label}</p>
      <p className="text-xs font-semibold text-slate-500">{valueLabel}</p>
    </div>
  )
}
