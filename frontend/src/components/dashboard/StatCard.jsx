export default function StatCard({ title, value, target, detail, icon: Icon, tone = 'navy' }) {
  const tones = {
    navy: 'bg-slate-100 text-navy',
    pink: 'bg-pink-50 text-accent',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700'
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-extrabold tracking-normal text-navy">{value}</p>
          {target && <p className="mt-1 text-sm font-medium text-slate-500">Target: {target}</p>}
        </div>
        {Icon && (
          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {detail && <p className="mt-4 text-sm font-medium text-slate-600">{detail}</p>}
    </article>
  )
}
