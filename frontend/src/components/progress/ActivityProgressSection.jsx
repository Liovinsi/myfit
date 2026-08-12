import { Dumbbell, Footprints, HeartPulse } from 'lucide-react'

const STEPS_TARGET = 5000

export default function ActivityProgressSection({ steps, workoutCompleted, cardioCompleted, restDay }) {
  const stepsPercent = Math.min(100, Math.round((steps / STEPS_TARGET) * 100))

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Activity Progress</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Today's activity</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Footprints className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-bold">Steps</span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-navy">
            {steps} / {STEPS_TARGET}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-accent" style={{ width: `${stepsPercent}%` }} />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${workoutCompleted || restDay ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-slate-600">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-bold">Workout</span>
          </div>
          <p className="mt-2 text-lg font-extrabold text-navy">
            {restDay ? 'Rest Day' : workoutCompleted ? 'Completed' : 'Not Completed'}
          </p>
        </div>

        <div className={`rounded-xl p-4 ${cardioCompleted ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 text-slate-600">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-bold">Cardio</span>
          </div>
          <p className="mt-2 text-lg font-extrabold text-navy">
            {cardioCompleted ? 'Completed' : 'Not Completed'}
          </p>
        </div>
      </div>
    </section>
  )
}
