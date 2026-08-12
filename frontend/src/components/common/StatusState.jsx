export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500 shadow-card">
      {label}
    </div>
  )
}

export function EmptyState({ title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <p className="text-base font-extrabold text-navy">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-500">{message}</p>
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
      {message}
    </div>
  )
}
