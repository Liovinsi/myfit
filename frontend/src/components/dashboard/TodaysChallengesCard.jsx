import { CheckCircle2, Coins, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../common/StatusState.jsx'
import { api, getTodayKey } from '../../lib/api.js'

export default function TodaysChallengesCard() {
  const [challenges, setChallenges] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dateKey = getTodayKey()

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const result = await api.getTodayChallenges(dateKey)

        if (isMounted) {
          setChallenges(result.challenges || [])
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

    load()

    return () => {
      isMounted = false
    }
  }, [dateKey])

  if (isLoading) {
    return <LoadingState label="Loading Today's Challenges..." />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <section className="dashboard-card p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-navy">
          <Trophy className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-extrabold tracking-normal text-navy">Today's Challenges</h2>
      </div>

      <ul className="mt-3 space-y-2">
        {challenges.map((challenge) => (
          <li
            key={challenge.id}
            className={`flex items-center gap-2 rounded-lg p-2 ${challenge.completed ? 'bg-emerald-50' : 'bg-slate-50'}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-navy">{challenge.name}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${challenge.completed ? 'bg-emerald-500' : 'bg-accent'}`}
                  style={{ width: `${challenge.percent}%` }}
                />
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-amber-700">
              <Coins className="h-3.5 w-3.5" aria-hidden="true" />
              {challenge.coinReward}
            </span>
            {challenge.completed && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
