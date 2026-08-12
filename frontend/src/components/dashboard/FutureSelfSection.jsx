import { HeartPulse } from 'lucide-react'

export default function FutureSelfSection() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
      <div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr]">
        <div className="p-7 md:p-9">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-normal text-navy md:text-3xl">
            Your Future Self Is Waiting.
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">
            Small consistent actions today create the stronger version of you tomorrow.
          </p>
        </div>
        <div className="flex min-h-56 items-center justify-center bg-slate-100 p-8">
          <img
            src="/myfit.png"
            alt="MyFit"
            className="max-h-44 w-full max-w-xs object-contain"
          />
        </div>
      </div>
    </section>
  )
}
