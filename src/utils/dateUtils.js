export function formatDate(isoString) {
  if (!isoString) return ''
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoString))
}

export function isOverdue(isoString) {
  if (!isoString) return false
  return new Date(isoString) < new Date()
}

export function minutesUntil(isoString) {
  if (!isoString) return null
  return Math.floor((new Date(isoString) - new Date()) / 60000)
}
