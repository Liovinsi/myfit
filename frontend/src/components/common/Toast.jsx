import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-extrabold text-white shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        {message}
      </div>
    </div>
  )
}
