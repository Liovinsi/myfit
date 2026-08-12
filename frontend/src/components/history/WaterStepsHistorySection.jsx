import ProgressRing from '../progress/ProgressRing.jsx'

const WATER_TARGET_ML = 4000
const STEPS_TARGET = 5000

export default function WaterStepsHistorySection({ waterMl, steps }) {
  const waterLitres = Math.round((waterMl / 1000) * 10) / 10

  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-extrabold text-navy">Water & Steps</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <ProgressRing
          value={waterMl}
          target={WATER_TARGET_ML}
          tone="blue"
          label="Water"
          valueLabel={`${waterLitres} / 4 L`}
        />
        <ProgressRing
          value={steps}
          target={STEPS_TARGET}
          tone="accent"
          label="Steps"
          valueLabel={`${steps} / ${STEPS_TARGET}`}
        />
      </div>
    </section>
  )
}
