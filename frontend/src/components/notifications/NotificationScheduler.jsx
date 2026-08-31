import { useEffect } from 'react'
import { getTodayKey } from '../../lib/api.js'
import {
  isNotificationsEnabled,
  motivationalMessages,
  notificationSchedule,
  sendNotification
} from '../../lib/notifications.js'

function currentTimeHHMM(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function sentKey(dateKey, slotId) {
  return `myfit-notif-sent-${dateKey}-${slotId}`
}

function dayIndexSince(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000)
}

export default function NotificationScheduler() {
  useEffect(() => {
    function checkSchedule() {
      if (!isNotificationsEnabled()) {
        return
      }

      const dateKey = getTodayKey()
      const nowHHMM = currentTimeHHMM()

      notificationSchedule.forEach((slot) => {
        if (slot.time !== nowHHMM) {
          return
        }

        const storageKey = sentKey(dateKey, slot.id)

        if (localStorage.getItem(storageKey)) {
          return
        }

        if (slot.id === 'motivation') {
          const message = motivationalMessages[dayIndexSince(dateKey) % motivationalMessages.length]
          sendNotification('MyFit', message)
        } else {
          sendNotification(slot.title, slot.body)
        }

        localStorage.setItem(storageKey, 'true')
      })
    }

    checkSchedule()
    const intervalId = setInterval(checkSchedule, 30000)

    return () => clearInterval(intervalId)
  }, [])

  return null
}
