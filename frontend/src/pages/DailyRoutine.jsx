import { Sunrise } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ErrorState, LoadingState } from '../components/common/StatusState.jsx'
import ExtraItemForm from '../components/routine/ExtraItemForm.jsx'
import ExtraItemsSection from '../components/routine/ExtraItemsSection.jsx'
import RoutineChecklistSection from '../components/routine/RoutineChecklistSection.jsx'
import StepsTracker from '../components/routine/StepsTracker.jsx'
import WaterTracker from '../components/routine/WaterTracker.jsx'
import { api, getTodayKey } from '../lib/api.js'

function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DailyRoutine() {
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [routineData, setRoutineData] = useState(null)
  const [dailyStats, setDailyStats] = useState({ steps: 0, waterMl: 0 })
  const [loadStatus, setLoadStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [isTogglingRoutine, setTogglingRoutine] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [isFormOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isSavingExtra, setSavingExtra] = useState(false)
  const [deletingExtraId, setDeletingExtraId] = useState('')
  const [extraError, setExtraError] = useState('')

  const loadDay = useCallback(async () => {
    setLoadStatus('loading')
    setLoadError('')

    try {
      const [routine, stats] = await Promise.all([api.getRoutine(selectedDate), api.getDailyStats(selectedDate)])
      setRoutineData(routine)
      setDailyStats(stats)
      setLoadStatus('ready')
    } catch (error) {
      setLoadStatus('error')
      setLoadError(error.message)
    }
  }, [selectedDate])

  useEffect(() => {
    let isMounted = true

    async function run() {
      if (isMounted) {
        await loadDay()
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [loadDay])

  async function refreshDailyStats() {
    try {
      const stats = await api.getDailyStats(selectedDate)
      setDailyStats(stats)
    } catch {
      // Steps/Water cards keep their last known values; the tracker components
      // surface their own save errors already.
    }
  }

  async function toggleItem(itemId) {
    if (!routineData || isTogglingRoutine) {
      return
    }

    const nextCompleted = routineData.completedItems.includes(itemId)
      ? routineData.completedItems.filter((id) => id !== itemId)
      : [...routineData.completedItems, itemId]

    setTogglingRoutine(true)
    setToggleError('')

    try {
      const result = await api.saveRoutineProgress({ dateKey: selectedDate, completedItems: nextCompleted })
      setRoutineData(result)
      await refreshDailyStats()
    } catch (error) {
      setToggleError(error.message)
    } finally {
      setTogglingRoutine(false)
    }
  }

  function openAddForm() {
    setEditingItem(null)
    setExtraError('')
    setFormOpen(true)
  }

  function openEditForm(item) {
    setEditingItem(item)
    setExtraError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingItem(null)
  }

  async function saveExtraItem(payload) {
    setSavingExtra(true)
    setExtraError('')

    try {
      if (editingItem) {
        const updated = await api.updateExtraRoutineItem(editingItem._id, payload)
        setRoutineData((current) => ({
          ...current,
          extraItems: current.extraItems.map((item) => (item._id === updated._id ? updated : item))
        }))
      } else {
        const created = await api.addExtraRoutineItem({ dateKey: selectedDate, ...payload })
        setRoutineData((current) => ({
          ...current,
          extraItems: [...current.extraItems, created]
        }))
      }

      await refreshDailyStats()
      closeForm()
    } catch (error) {
      setExtraError(error.message)
    } finally {
      setSavingExtra(false)
    }
  }

  async function deleteExtraItem(item) {
    setDeletingExtraId(item._id)
    setExtraError('')

    try {
      await api.deleteExtraRoutineItem(item._id)
      setRoutineData((current) => ({
        ...current,
        extraItems: current.extraItems.filter((existing) => existing._id !== item._id)
      }))
      await refreshDailyStats()
    } catch (error) {
      setExtraError(error.message)
    } finally {
      setDeletingExtraId('')
    }
  }

  if (loadStatus === 'loading') {
    return <LoadingState label="Loading Daily Routine..." />
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Today's Routine</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold text-navy">
            <Sunrise className="h-7 w-7 text-accent" aria-hidden="true" />
            {formatDisplayDate(selectedDate)}
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

      {loadStatus === 'error' && <ErrorState message={loadError} onRetry={loadDay} />}

      {routineData && (
        <>
          <section className="dashboard-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Today's Progress</p>
                <p className="mt-1 text-base font-extrabold text-navy">
                  {routineData.completedCount} / {routineData.totalCount} completed
                </p>
              </div>
              <span className="text-3xl font-extrabold text-accent">{routineData.completionPercent}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${routineData.completionPercent}%` }}
              />
            </div>
            {toggleError && <p className="mt-3 text-sm font-semibold text-rose-600">{toggleError}</p>}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <StepsTracker dateKey={selectedDate} steps={dailyStats.steps || 0} onUpdate={setDailyStats} />
            <WaterTracker dateKey={selectedDate} waterMl={dailyStats.waterMl || 0} onUpdate={setDailyStats} />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {routineData.routine.sections.map((section) => (
              <RoutineChecklistSection
                key={section.id}
                section={section}
                completedItems={routineData.completedItems}
                onToggle={toggleItem}
                disabled={isTogglingRoutine}
              />
            ))}
          </section>

          {extraError && <ErrorState message={extraError} />}

          <ExtraItemsSection
            extraItems={routineData.extraItems}
            onAddClick={openAddForm}
            onEditClick={openEditForm}
            onDeleteClick={deleteExtraItem}
            deletingId={deletingExtraId}
          />

          {isFormOpen && (
            <ExtraItemForm
              editingItem={editingItem}
              onCancel={closeForm}
              onSave={saveExtraItem}
              isSaving={isSavingExtra}
            />
          )}
        </>
      )}
    </div>
  )
}
