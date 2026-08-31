import { CheckCircle2, Circle, Dumbbell, Droplets, HeartPulse, ListChecks, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api, getTodayKey } from '../lib/api.js'

const checklistMeta = [
  { key: 'workoutCompleted', label: 'Workout Completed', icon: Dumbbell, manual: false },
  { key: 'cardioCompleted', label: 'Cardio Completed', icon: HeartPulse, manual: false },
  { key: 'water3L', label: 'Water 3L', icon: Droplets, manual: false },
  { key: 'dietFollowed', label: 'Diet Followed', icon: Utensils, manual: true },
  { key: 'proteinGoalReached', label: 'Protein Goal Reached', icon: ListChecks, manual: false }
]

export default function DailyChecklist() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    api
      .getChecklist(selectedDate)
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

  async function toggleDietFollowed() {
    if (!data) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const result = await api.setDietFollowed({
        dateKey: selectedDate,
        dietFollowed: !data.items.dietFollowed
      })
      setData(result)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading Daily Checklist..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Daily Checklist</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">Today's Checklist</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Track the five habits that keep you on plan.
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
              <p className="text-base font-extrabold text-navy">Completion</p>
              <span className="text-2xl font-extrabold text-accent">{data.completionPercent}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${data.completionPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {data.completedCount} of {data.totalCount} completed
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {checklistMeta.map(({ key, label, icon: Icon, manual }) => {
              const completed = Boolean(data.items[key])

              return (
                <article
                  key={key}
                  className={`dashboard-card flex items-center justify-between gap-4 p-5 ${
                    completed ? 'border-emerald-200 bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-navy'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold text-navy">{label}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {manual ? 'Tap to mark done' : 'Auto-tracked'}
                      </p>
                    </div>
                  </div>
                  {manual ? (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={toggleDietFollowed}
                      aria-label={completed ? 'Mark diet not followed' : 'Mark diet followed'}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Circle className="h-8 w-8 text-slate-300" aria-hidden="true" />
                      )}
                    </button>
                  ) : completed ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Circle className="h-8 w-8 text-slate-300" aria-hidden="true" />
                  )}
                </article>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}
