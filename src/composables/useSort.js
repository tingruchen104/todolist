import { ref, computed } from 'vue'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export function useSort(tasks) {
  const sortBy = ref('createdAt')

  const sorted = computed(() =>
    [...tasks.value].sort((a, b) => {
      if (sortBy.value === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy.value === 'priority') {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  )

  return { sortBy, sorted }
}
