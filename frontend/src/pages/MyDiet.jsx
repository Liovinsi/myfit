import { Droplets, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api } from '../lib/api.js'

// Excluded here rather than in the shared dailyRoutine.js source, since that data also
// feeds the separate Daily Routine checklist page, which still needs Post Workout.
const EXCLUDED_SECTION_IDS = ['post-workout']

function formatToday(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function MyDiet() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .getRoutine()
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
  }, [])

  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  if (isLoading) {
    return <LoadingState label="Loading My Diet..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">My Diet</p>
          <h1 className="mt-2 text-3xl font-extrabold text-navy">{weekday} Diet</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            {formatToday()} · Your complete meal plan for today
          </p>
        </div>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-accent">
          <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
        </span>
      </section>

      {error && <ErrorState message={error} />}

      {data && (
        <>
          <section className="dashboard-card p-5">
            <p className="text-sm font-bold text-slate-500">Wake Up</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">{data.routine.wakeUpTime}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {data.routine.sections
              .filter((section) => !EXCLUDED_SECTION_IDS.includes(section.id))
              .map((section) => (
                <article key={section.id} className="dashboard-card p-5">
                  <h2 className="text-lg font-extrabold text-navy">{section.title}</h2>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
          </section>

          <section className="dashboard-card flex items-center gap-4 border-blue-100 bg-blue-50 p-5">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
              <Droplets className="h-5 w-5" aria-hidden="true" />
            </span>
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
