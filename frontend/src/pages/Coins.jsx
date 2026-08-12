import { useEffect, useMemo, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import RewardHistorySection from '../components/coins/RewardHistorySection.jsx'
import TodaysRewardsSection from '../components/coins/TodaysRewardsSection.jsx'
import { api, getTodayKey } from '../lib/api.js'

const REWARD_ICONS = {
  workout: '🏋️',
  steps: '👣',
  water: '💧',
  challenge: '🏆'
}

export default function Coins() {
  const [transactions, setTransactions] = useState([])
  const [totalCoins, setTotalCoins] = useState(0)
  const [todayCoins, setTodayCoins] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lookupDate, setLookupDate] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [isLookupLoading, setLookupLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const result = await api.getRewards()

        if (isMounted) {
          setTransactions(result.transactions || [])
          setTotalCoins(result.totalCoins || 0)
          setTodayCoins(result.todayCoins || 0)
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
  }, [])

  async function lookupDateRewards(dateKey) {
    setLookupDate(dateKey)

    if (!dateKey) {
      setLookupResult(null)
      return
    }

    setLookupLoading(true)
    setError('')

    try {
      const result = await api.getRewardsForDate(dateKey)
      setLookupResult(result)
    } catch (lookupError) {
      setError(lookupError.message)
    } finally {
      setLookupLoading(false)
    }
  }

  const todayKey = getTodayKey()
  const todaysTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.dateKey === todayKey),
    [transactions, todayKey]
  )

  const { historyByDate, historyDates } = useMemo(() => {
    const grouped = {}

    transactions.forEach((transaction) => {
      if (transaction.dateKey === todayKey) {
        return
      }

      if (!grouped[transaction.dateKey]) {
        grouped[transaction.dateKey] = []
      }

      grouped[transaction.dateKey].push(transaction)
    })

    const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1))

    return { historyByDate: grouped, historyDates: dates }
  }, [transactions, todayKey])

  if (isLoading) {
    return <LoadingState label="Loading Coins..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Rewards</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-navy">🪙 Coins</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Earn coins by hitting your daily workout, steps, water, and challenge goals.
          </p>
        </div>
      </section>

      {error && <ErrorState message={error} />}

      <section className="rounded-3xl bg-gradient-to-r from-navy via-navy to-accent p-8 text-center text-white shadow-card">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/70">Total Coins</p>
        <p className="mt-3 text-5xl font-extrabold">🪙 {totalCoins}</p>
        <p className="mt-2 text-sm font-semibold text-white/70">Today: +{todayCoins} coins</p>
      </section>

      <TodaysRewardsSection transactions={todaysTransactions} />

      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">View a Specific Date</h2>
          <input
            type="date"
            value={lookupDate}
            onChange={(event) => lookupDateRewards(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 font-semibold outline-none focus:border-accent"
          />
        </div>

        {isLookupLoading && <p className="mt-3 text-sm font-semibold text-slate-500">Loading...</p>}

        {!isLookupLoading && lookupResult && (
          <div className="mt-4">
            {lookupResult.transactions.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">No rewards recorded for this date.</p>
            ) : (
              <>
                <div className="space-y-1">
                  {lookupResult.transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between py-1 text-sm">
                      <span className="font-bold text-slate-600">
                        {REWARD_ICONS[transaction.rewardType] || '🪙'} {transaction.description}
                      </span>
                      <span className="font-extrabold text-slate-500">+{transaction.coins}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm font-extrabold text-navy">Total: +{lookupResult.totalCoins}</p>
              </>
            )}
          </div>
        )}
      </section>

      <RewardHistorySection historyByDate={historyByDate} historyDates={historyDates} />
    </div>
  )
}
