import { Sunrise } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api, getTodayKey } from '../lib/api.js'

export default function DailyRoutine() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(true)
  const [savingItemId, setSavingItemId] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    api
      .getRoutine(selectedDate)
      .then((result) => {
        if (isMounted) {
          setData(result)
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  async function toggleItem(itemId) {
    if (!data) {
      return
    }

    const nextCompleted = data.completedItems.includes(itemId)
      ? data.completedItems.filter((id) => id !== itemId)
      : [...data.completedItems, itemId]

    setSavingItemId(itemId)
    setError('')

    try {
      const result = await api.saveRoutineProgress({ dateKey: selectedDate, completedItems: nextCompleted })
      setData(result)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingItemId('')
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading Daily Routine..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Daily Routine</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">
            <Sunrise className="mr-2 inline h-7 w-7 text-accent" aria-hidden="true" />
            {data?.routine.wakeUpTime} Wake Up
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Check off each step as you go through your day.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </label>
      </section>

      {error && <ErrorState message={error} />}

      {data && (
        <>
          <section className="dashboard-card p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-base font-extrabold text-navy">Routine Completion</p>
              <span className="text-2xl font-extrabold text-accent">{data.completionPercent}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${data.completionPercent}%` }}
              />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {data.routine.sections.map((section) => (
              <article key={section.id} className="dashboard-card p-5">
                <h2 className="text-lg font-extrabold text-navy">{section.title}</h2>
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => {
                    const checked = data.completedItems.includes(item.id)
                    return (
                      <li key={item.id}>
                        <label
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition ${
                            checked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={savingItemId === item.id}
                            onChange={() => toggleItem(item.id)}
                            className="h-5 w-5 rounded border-slate-300 text-accent focus:ring-accent"
                          />
                          {item.label}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </section>

          <section className="dashboard-card flex items-center gap-4 border-blue-100 bg-blue-50 p-5">
            <div>
              <p className="text-base font-extrabold text-navy">Water Target</p>
              <p className="text-sm font-bold text-blue-700">{data.routine.waterTargetLitres} Litres Daily</p>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
