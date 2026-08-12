import { CheckCircle2, Flame, HeartPulse } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cardioImage, exerciseImages, fallbackExerciseImage } from '../../data/exerciseImages.js'

function ExerciseCard({ exercise, checked, onToggle, compact }) {
  const imageSrc = exerciseImages[exercise.name] || fallbackExerciseImage

  if (compact) {
    return (
      <article className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
        <img src={imageSrc} alt="" aria-hidden="true" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold tracking-normal text-navy">{exercise.name}</h3>
          <p className="text-xs font-bold text-slate-500">
            {exercise.sets} × {exercise.reps}
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-600">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(exercise.name)}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          Completed
        </label>
      </article>
    )
  }

  return (
    <article className="dashboard-card flex min-h-36 gap-4 p-4">
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-base font-extrabold tracking-normal text-navy">{exercise.name}</h3>
        <p className="mt-1 text-sm font-bold text-slate-500">
          {exercise.sets} × {exercise.reps}
        </p>
        <label className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(exercise.name)}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          Completed
        </label>
      </div>
    </article>
  )
}

function CardioCard({ checked, onToggle, compact }) {
  if (compact) {
    return (
      <article className="flex items-center gap-2 rounded-lg border border-pink-100 bg-pink-50 p-2">
        <img src={cardioImage} alt="" aria-hidden="true" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-pink-700" aria-hidden="true" />
            <h3 className="text-sm font-extrabold tracking-normal text-navy">Cardio</h3>
          </div>
          <p className="text-xs font-bold text-slate-600">30 Minutes</p>
        </div>
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          Completed
        </label>
      </article>
    )
  }

  return (
    <article className="dashboard-card flex gap-4 border-pink-100 bg-pink-50 p-4">
      <img src={cardioImage} alt="" aria-hidden="true" className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-pink-700" aria-hidden="true" />
          <h3 className="text-base font-extrabold tracking-normal text-navy">Cardio</h3>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-600">30 Minutes</p>
        <label className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          Completed
        </label>
      </div>
    </article>
  )
}

function EstimatedBurnCard({ workout, compact }) {
  if (compact || !workout.estimatedBurn) {
    return null
  }

  return (
    <article className={`${compact ? 'rounded-xl border border-amber-100 bg-amber-50 p-3' : 'dashboard-card border-amber-100 bg-amber-50 p-4'}`}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
          <Flame className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-extrabold tracking-normal text-navy">Estimated Burn</h3>
          <p className="mt-1 text-sm font-extrabold text-amber-800">{workout.estimatedBurn}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Estimate only · {workout.estimateBasis}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function WorkoutDayPanel({
  workout,
  dateKey,
  completion,
  isCompleting = false,
  onComplete,
  onProgressChange,
  compact = false
}) {
  const [checkedExercises, setCheckedExercises] = useState(() => completion?.completedExercises || [])
  const [cardioComplete, setCardioComplete] = useState(() => Boolean(completion?.cardioCompleted))

  useEffect(() => {
    setCheckedExercises(completion?.completedExercises || [])
    setCardioComplete(Boolean(completion?.cardioCompleted))
  }, [dateKey, workout?.day, completion])

  const completedCount = useMemo(
    () => checkedExercises.filter((name) => workout?.exercises?.some((exercise) => exercise.name === name)).length,
    [checkedExercises, workout]
  )

  if (!workout) {
    return null
  }

  if (workout.day === 'Sunday') {
    return (
      <section className="dashboard-card p-6 text-center">
        <p className="text-3xl" aria-hidden="true">😴</p>
        <h2 className="mt-3 text-xl font-extrabold tracking-normal text-navy">Rest Day</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">No resistance workout scheduled for Sunday.</p>
      </section>
    )
  }

  function toggleExercise(name) {
    const nextExercises = checkedExercises.includes(name)
      ? checkedExercises.filter((exerciseName) => exerciseName !== name)
      : [...checkedExercises, name]

    setCheckedExercises(nextExercises)
    onProgressChange?.({ completedExercises: nextExercises, cardioCompleted: cardioComplete })
  }

  function toggleCardio() {
    const nextCardioComplete = !cardioComplete
    setCardioComplete(nextCardioComplete)
    onProgressChange?.({ completedExercises: checkedExercises, cardioCompleted: nextCardioComplete })
  }

  const completed = Boolean(completion?.completed)

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4'}>
      {!compact && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-normal text-navy">
              {workout.day} - {workout.workoutName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {dateKey} · {completedCount} / {workout.exercises.length} exercises completed
            </p>
          </div>
          {completed && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Workout Completed
            </span>
          )}
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500">
            {completedCount} / {workout.exercises.length} exercises completed
          </p>
          {completed && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
      )}

      <div className={compact ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.name}
            exercise={exercise}
            checked={checkedExercises.includes(exercise.name)}
            onToggle={toggleExercise}
            compact={compact}
          />
        ))}
      </div>

      <CardioCard checked={cardioComplete} onToggle={toggleCardio} compact={compact} />

      <EstimatedBurnCard workout={workout} compact={compact} />

      <div
        className={
          compact
            ? 'flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:flex-row sm:items-center sm:justify-between'
            : 'dashboard-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <p className={compact ? 'text-xs font-bold text-slate-600' : 'text-sm font-bold text-slate-600'}>
          Complete Workout saves {workout.day} - {workout.workoutName} for {dateKey}.
        </p>
        <button
          type="button"
          disabled={completed || isCompleting}
          onClick={() => onComplete?.(workout.day)}
          className={
            compact
              ? 'inline-flex shrink-0 items-center justify-center rounded-lg bg-navy px-4 py-2 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400'
              : 'inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-400'
          }
        >
          {completed ? 'Workout Completed' : isCompleting ? 'Saving...' : 'Complete Workout'}
        </button>
      </div>
    </section>
  )
}
