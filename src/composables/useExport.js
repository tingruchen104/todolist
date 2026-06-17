import { useStorage } from '@/composables/useStorage'

export function useExport() {
  function exportJson() {
    const { loadData } = useStorage()
    const data = loadData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todolist-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportJson }
}
