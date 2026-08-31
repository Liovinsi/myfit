import { Bell, BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getNotificationPermission,
  isNotificationSupported,
  isNotificationsEnabled,
  requestNotificationPermission,
  setNotificationsEnabled
} from '../../lib/notifications.js'

export default function NotificationBell() {
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState('default')

  useEffect(() => {
    setEnabled(isNotificationsEnabled())
    setPermission(getNotificationPermission())
  }, [])

  if (!isNotificationSupported()) {
    return null
  }

  async function handleToggle() {
    if (enabled) {
      setNotificationsEnabled(false)
      setEnabled(false)
      return
    }

    const result = await requestNotificationPermission()
    setPermission(result)

    if (result === 'granted') {
      setNotificationsEnabled(true)
      setEnabled(true)
    }
  }

  const isBlocked = permission === 'denied'

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isBlocked}
      title={
        isBlocked
          ? 'Notifications are blocked in your browser settings'
          : enabled
            ? 'Turn off MyFit reminders'
            : 'Turn on MyFit reminders'
      }
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? 'border-accent bg-pink-50 text-accent' : 'border-slate-200 text-navy'
      }`}
      aria-label={enabled ? 'Notifications on' : 'Notifications off'}
    >
      {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
    </button>
  )
}
