import { CheckCircle2, HeartPulse } from 'lucide-react'

export default function WorkoutHistorySection({ workout, completion, completed }) {
  if (!workout) {
    return (
      <section className="dashboard-card p-5">
        <h2 className="text-lg font-extrabold text-navy">Workout History</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">No workout data for this date.</p>
      </section>
    )
  }

  if (workout.day === 'Sunday') {
    return (
      <section className="dashboard-card p-5 text-center">
        <h2 className="text-lg font-extrabold text-navy">Workout History</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">😴 Rest Day — no workout scheduled.</p>
      </section>
    )
  }

  const completedExercises = completion?.completedExercises || []

  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-navy">Workout History</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {workout.day} - {workout.workoutName}
          </p>
        </div>
        {completed && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Completed
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {workout.exercises.map((exercise) => {
          const done = completedExercises.includes(exercise.name)

          return (
            <div
              key={exercise.name}
              className={`flex items-center justify-between gap-2 rounded-lg p-2 text-sm ${done ? 'bg-emerald-50' : 'bg-slate-50'}`}
            >
              <span className="font-bold text-navy">{exercise.name}</span>
              <span className="text-xs font-semibold text-slate-500">
                {exercise.sets} × {exercise.reps}
              </span>
              {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-pink-50 p-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-pink-700" aria-hidden="true" />
          <span className="text-sm font-bold text-navy">Cardio</span>
        </div>
        <span
          className={`text-xs font-extrabold ${completion?.cardioCompleted ? 'text-emerald-700' : 'text-slate-500'}`}
        >
          {completion?.cardioCompleted ? 'Completed' : 'Not Completed'}
        </span>
      </div>

      {workout.estimatedBurn && (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Estimated Burn: {workout.estimatedBurn} · {workout.estimateBasis}
        </p>
      )}
    </section>
  )
}
