import { useEffect, useState } from 'react'
import ChallengeCard from '../components/challenges/ChallengeCard.jsx'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import { api, getTodayKey } from '../lib/api.js'

export default function Challenges() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [dailyChallenges, setDailyChallenges] = useState([])
  const [weeklyChallenges, setWeeklyChallenges] = useState([])
  const [weekDates, setWeekDates] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      setLoading(true)
      setError('')

      try {
        const [dailyResult, weeklyResult] = await Promise.all([
          api.getTodayChallenges(selectedDate),
          api.getWeeklyChallenges(selectedDate)
        ])

        if (isMounted) {
          setDailyChallenges(dailyResult.challenges || [])
          setWeeklyChallenges(weeklyResult.challenges || [])
          setWeekDates(weeklyResult.weekDates || null)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  if (isLoading) {
    return <LoadingState label="Loading Challenges..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Challenges</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">🏆 Challenges</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Complete daily and weekly challenges using your real MyFit activity to earn coin rewards.
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

      <section>
        <h2 className="text-lg font-extrabold text-navy">Daily Challenges</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">For {selectedDate}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dailyChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-navy">Weekly Challenges</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {weekDates ? `Week of ${weekDates[0]} – ${weekDates[6]}` : ''}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weeklyChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
    </div>
  )
}
