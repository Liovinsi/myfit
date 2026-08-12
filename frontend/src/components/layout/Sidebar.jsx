import { NavLink } from 'react-router-dom'
import Brand from './Brand.jsx'
import { navigationItems } from './navigation.js'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform lg:static lg:z-auto lg:min-h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Brand />
        <nav className="mt-9 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                  }`
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
