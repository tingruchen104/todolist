import { ref } from 'vue'

const isSupported = 'Notification' in window
const permission = ref(isSupported ? Notification.permission : 'denied')
const timers = new Map()

export function useNotification() {
  async function requestPermission() {
    if (!isSupported) return false
    const result = await Notification.requestPermission()
    permission.value = result
    return result === 'granted'
  }

  function scheduleReminder(task, minutesBefore = 15) {
    if (!task.dueDate) return
    cancelReminder(task.id)

    const fireAt = new Date(task.dueDate).getTime() - minutesBefore * 60 * 1000
    const delay = fireAt - Date.now()
    if (delay <= 0) return

    const timerId = setTimeout(() => {
      showNotification(task)
      timers.delete(task.id)
    }, delay)

    timers.set(task.id, timerId)
  }

  function cancelReminder(taskId) {
    if (timers.has(taskId)) {
      clearTimeout(timers.get(taskId))
      timers.delete(taskId)
    }
  }

  function showNotification(task) {
    if (isSupported && permission.value === 'granted') {
      new Notification('待辦提醒', {
        body: task.title,
        icon: '/favicon.ico'
      })
    } else {
      showToast(`⏰ ${task.title}`)
    }
  }

  function showToast(message) {
    const toast = document.createElement('div')
    toast.textContent = message
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#111827',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: '9999',
      transition: 'opacity 0.3s'
    })
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  return { isSupported, permission, requestPermission, scheduleReminder, cancelReminder, showToast }
}
