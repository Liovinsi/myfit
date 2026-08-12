const CALORIE_TARGET = 1300
const PROTEIN_TARGET = 70
const WATER_TARGET_ML = 4000
const STEPS_TARGET = 5000

function CompletionRow({ label, percent, completed }) {
  const clampedPercent = Math.min(100, Math.max(0, percent))

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span className={completed ? 'text-emerald-600' : 'text-navy'}>
          {completed ? 'Done' : `${clampedPercent}%`}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-accent'}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  )
}

export default function DailyCompletionSection({ calories, protein, waterMl, steps, workoutCompleted }) {
  const caloriePercent = Math.round((calories / CALORIE_TARGET) * 100)
  const proteinPercent = Math.round((protein / PROTEIN_TARGET) * 100)
  const waterPercent = Math.round((waterMl / WATER_TARGET_ML) * 100)
  const stepsPercent = Math.round((steps / STEPS_TARGET) * 100)

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Daily Completion</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-5">
        <CompletionRow label="Nutrition" percent={caloriePercent} />
        <CompletionRow label="Protein" percent={proteinPercent} />
        <CompletionRow label="Water" percent={waterPercent} />
        <CompletionRow label="Steps" percent={stepsPercent} />
        <CompletionRow label="Workout" percent={workoutCompleted ? 100 : 0} completed={workoutCompleted} />
      </div>
    </section>
  )
}
