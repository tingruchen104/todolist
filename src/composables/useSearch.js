import { ref, computed } from 'vue'

export function useSearch(tasks) {
  const query = ref('')

  const filtered = computed(() => {
    if (!query.value.trim()) return tasks.value
    const q = query.value.toLowerCase()
    return tasks.value.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    )
  })

  return { query, filtered }
}
