import { Award, Flame, Rocket, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api } from '../lib/api.js'

export default function HundredDaysChallenge() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(true)
  const [togglingDay, setTogglingDay] = useState(null)

  function load() {
    return api
      .getHundredDaysChallenge()
      .then((result) => setData(result))
      .catch((loadError) => setError(loadError.message))
  }

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [])

  async function toggleDay(dayNumber, isFuture) {
    if (isFuture) {
      return
    }

    setTogglingDay(dayNumber)
    setError('')

    try {
      const result = await api.toggleHundredDaysDay(dayNumber)
      setData(result)
    } catch (toggleError) {
      setError(toggleError.message)
    } finally {
      setTogglingDay(null)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading 100 Days Challenge..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">100 Days Challenge</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">Day {data ? data.totalCompleted : 0} of 100</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Started {data?.startDateKey}. Tap a day to mark it complete.
          </p>
        </div>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-accent">
          <Rocket className="h-6 w-6" aria-hidden="true" />
        </span>
      </section>

      {error && <ErrorState message={error} />}

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="dashboard-card p-5">
              <p className="text-sm font-semibold text-slate-500">Progress</p>
              <p className="mt-2 text-2xl font-extrabold text-navy">{data.progressPercent}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-accent" style={{ width: `${data.progressPercent}%` }} />
              </div>
            </article>
            <article className="dashboard-card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Current Streak</p>
                <p className="mt-2 text-2xl font-extrabold text-navy">{data.currentStreak} Days</p>
              </div>
              <Flame className="h-8 w-8 text-accent" aria-hidden="true" />
            </article>
            <article className="dashboard-card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Longest Streak</p>
                <p className="mt-2 text-2xl font-extrabold text-navy">{data.longestStreak} Days</p>
              </div>
              <Award className="h-8 w-8 text-accent" aria-hidden="true" />
            </article>
            <article className="dashboard-card flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Days Remaining</p>
                <p className="mt-2 text-2xl font-extrabold text-navy">{data.daysRemaining}</p>
              </div>
              <Target className="h-8 w-8 text-accent" aria-hidden="true" />
            </article>
          </section>

          <section className="dashboard-card p-5">
            <h2 className="text-lg font-extrabold text-navy">100 Days Grid</h2>
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {data.days.map((day) => {
                const isDisabled = day.isFuture || togglingDay === day.dayNumber
                const stateClasses = day.completed
                  ? 'bg-emerald-500 text-white'
                  : day.isToday
                    ? 'border-2 border-accent bg-white text-navy'
                    : day.isFuture
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'

                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleDay(day.dayNumber, day.isFuture)}
                    title={day.dateKey}
                    className={`flex aspect-square items-center justify-center rounded-lg text-xs font-extrabold transition disabled:cursor-not-allowed ${stateClasses}`}
                  >
                    {day.dayNumber}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500" /> Completed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border-2 border-accent bg-white" /> Today
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-100" /> Upcoming
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
