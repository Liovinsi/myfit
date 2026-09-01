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

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-rose-700"
        >
          Retry
        </button>
      )}
    </div>
  )
}
