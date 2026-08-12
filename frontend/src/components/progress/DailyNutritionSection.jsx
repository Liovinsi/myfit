import ProgressRing from './ProgressRing.jsx'

const CALORIE_TARGET = 1300
const PROTEIN_TARGET = 70
const WATER_TARGET_ML = 4000

export default function DailyNutritionSection({ calories, protein, waterMl }) {
  const waterLitres = Math.round((waterMl / 1000) * 10) / 10

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Daily Nutrition Progress</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Today's totals against your daily targets</p>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        <ProgressRing
          value={calories}
          target={CALORIE_TARGET}
          tone="accent"
          label="Calories"
          valueLabel={`${calories} / ${CALORIE_TARGET} kcal`}
        />
        <ProgressRing
          value={protein}
          target={PROTEIN_TARGET}
          tone="emerald"
          label="Protein"
          valueLabel={`${protein} / ${PROTEIN_TARGET} g`}
        />
        <ProgressRing
          value={waterMl}
          target={WATER_TARGET_ML}
          tone="blue"
          label="Water"
          valueLabel={`${waterLitres} / 4 L`}
        />
      </div>
    </section>
  )
}
