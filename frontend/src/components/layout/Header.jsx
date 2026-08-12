import { Menu } from 'lucide-react'
import Brand from './Brand.jsx'

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <Brand compact />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-navy shadow-sm"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
