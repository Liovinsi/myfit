const CALORIE_TARGET = 1300

function average(numbers) {
  if (numbers.length === 0) {
    return null
  }

  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-extrabold text-navy">{value}</p>
    </div>
  )
}

export default function MonthlyProgressSection({ days, rangeLabel }) {
  const scheduledWorkoutDays = days.filter((day) => !day.restDay)
  const completedWorkoutDays = scheduledWorkoutDays.filter((day) => day.workoutCompleted)
  const workoutConsistency = scheduledWorkoutDays.length > 0
    ? Math.round((completedWorkoutDays.length / scheduledWorkoutDays.length) * 100)
    : null

  const avgSteps = average(days.map((day) => day.steps))
  const avgWaterLitres = average(days.map((day) => day.waterMl / 1000))
  const avgProtein = average(days.map((day) => day.protein))

  const daysWithCalorieData = days.filter((day) => day.calories > 0)
  const calorieConsistency = daysWithCalorieData.length > 0
    ? Math.round(
        (daysWithCalorieData.filter((day) => day.calories <= CALORIE_TARGET).length / daysWithCalorieData.length) *
          100
      )
    : null

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Long-Term Progress</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Aggregated over {rangeLabel}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatBlock label="Workout Consistency" value={workoutConsistency != null ? `${workoutConsistency}%` : 'No data'} />
        <StatBlock label="Avg Daily Steps" value={avgSteps ? `${avgSteps}` : 'No data'} />
        <StatBlock label="Avg Water Intake" value={avgWaterLitres ? `${avgWaterLitres} L` : 'No data'} />
        <StatBlock label="Avg Protein" value={avgProtein ? `${avgProtein} g` : 'No data'} />
        <StatBlock
          label="Calorie-Target Consistency"
          value={calorieConsistency != null ? `${calorieConsistency}%` : 'No data'}
        />
      </div>
    </section>
  )
}
