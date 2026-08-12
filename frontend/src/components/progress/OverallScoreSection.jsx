export default function OverallScoreSection({ score, metrics, rangeLabel }) {
  return (
    <section className="dashboard-card p-6 text-center">
      <h2 className="text-lg font-extrabold text-navy">Overall Progress Score</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Based on {rangeLabel}</p>

      {score == null ? (
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Not enough tracked data yet to calculate a score.
        </p>
      ) : (
        <>
          <p className="mt-4 text-5xl font-extrabold text-accent">{score}%</p>
          <p className="mx-auto mt-4 max-w-md text-xs font-semibold text-slate-500">
            Calculated as the average of your: {metrics.join(', ')}.
          </p>
        </>
      )}
    </section>
  )
}
