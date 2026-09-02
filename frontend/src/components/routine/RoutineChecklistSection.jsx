export default function RoutineChecklistSection({ section, completedItems, onToggle, disabled }) {
  return (
    <article className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">{section.title}</h2>
      <ul className="mt-3 space-y-2">
        {section.items.map((item) => {
          const checked = completedItems.includes(item.id)

          return (
            <li key={item.id}>
              <label
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                  checked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'
                } ${disabled ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(item.id)}
                  className="h-5 w-5 shrink-0 rounded border-slate-300 text-accent focus:ring-accent"
                />
                <span className="flex-1">
                  {item.label}
                  {item.waterCreditMl > 0 && (
                    <span className="mt-0.5 block text-xs font-semibold text-blue-600">
                      Adds {item.waterCreditMl} ml to today's water automatically
                    </span>
                  )}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
