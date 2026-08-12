import { Construction } from 'lucide-react'

export default function ComingSoon({ title = 'Feature' }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="dashboard-card w-full max-w-2xl p-8 text-center md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-accent">
          <Construction className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.18em] text-accent">{title}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-normal text-navy">Feature coming soon</h1>
        <p className="mx-auto mt-4 max-w-md text-base font-medium leading-7 text-slate-600">
          Phase 1 is currently focused on building the MyFit dashboard foundation.
        </p>
      </div>
    </section>
  )
}
