import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NotificationBell from '../notifications/NotificationBell.jsx'
import NotificationScheduler from '../notifications/NotificationScheduler.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <NotificationScheduler />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 lg:py-8">
          <div className="mb-4 hidden justify-end lg:flex">
            <NotificationBell />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
