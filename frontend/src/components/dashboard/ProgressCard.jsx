export default function ProgressCard() {
  return (
    <section className="dashboard-card self-start p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold tracking-normal text-navy">Today's Progress</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Daily Completion</p>
        </div>
        <span className="text-2xl font-extrabold tracking-normal text-accent">0%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-0 rounded-full bg-accent" aria-label="Daily completion 0%" />
      </div>
    </section>
  )
}
