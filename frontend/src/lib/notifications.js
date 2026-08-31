export const ENABLED_STORAGE_KEY = 'myfit-notifications-enabled'

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  return isNotificationSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  return Notification.requestPermission()
}

export function isNotificationsEnabled() {
  return localStorage.getItem(ENABLED_STORAGE_KEY) === 'true'
}

export function setNotificationsEnabled(enabled) {
  localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false')
}

export function sendNotification(title, body) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return
  }

  try {
    new Notification(title, { body, icon: '/myfit.png' })
  } catch {
    // Some browsers (e.g. iOS Safari) throw on direct Notification construction; skip silently.
  }
}

export const motivationalMessages = [
  '👗 Nov 22 function ku fit aaganum',
  '🔥 Saree goal loading',
  '💪 Stay consistent',
  '🎯 Get Fit'
]

export const notificationSchedule = [
  { id: 'water-morning', time: '08:00', title: '💧 Water kudinga', body: 'Start the day with a glass of water.' },
  { id: 'workout-time', time: '05:45', title: '🏋️ Gym time', body: "Today's workout is waiting for you." },
  { id: 'water-midday', time: '11:30', title: '💧 Water kudinga', body: 'Keep sipping — stay on track for 3L today.' },
  { id: 'water-afternoon', time: '15:00', title: '💧 Water kudinga', body: "Afternoon check-in — top up your water." },
  { id: 'water-evening', time: '18:00', title: '💧 Water kudinga', body: 'A couple more glasses before dinner.' },
  { id: 'weight-checkin', time: '21:00', title: '⚖️ Weight update pannunga', body: 'Log today\'s weight before you wind down.' },
  { id: 'motivation', time: '09:00', title: 'MyFit', body: '' }
]
