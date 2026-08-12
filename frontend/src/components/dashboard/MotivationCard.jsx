import { Flame } from 'lucide-react'

const quotes = {
  Monday: 'Nothing looks as good as healthy feels.',
  Tuesday: 'Stop wishing. Start doing.',
  Wednesday: 'Make it happen. Shock every single one of them.',
  Thursday: "Excuses don't burn calories.",
  Friday: 'Small steps every day create big changes.',
  Saturday: 'Discipline today. Results tomorrow.',
  Sunday: 'Rest, reset and get ready for another week.'
}

export function getWeekdayQuote(date = new Date()) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  return quotes[weekday] ?? quotes.Monday
}

export default function MotivationCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-navy to-accent p-6 text-white shadow-card md:p-8">
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
          <Flame className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">Daily Motivation</h2>
          <p className="mt-2 text-xl font-extrabold leading-snug tracking-normal text-white md:text-2xl">
            "{getWeekdayQuote()}"
          </p>
        </div>
      </div>
    </section>
  )
}
