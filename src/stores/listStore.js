import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { useTaskStore } from '@/stores/taskStore'
import { generateId } from '@/utils/idUtils'

export const useListStore = defineStore('lists', () => {
  const { loadData, saveData } = useStorage()
  const lists = ref([])

  const active = computed(() => lists.value.filter((l) => !l.archived))
  const archived = computed(() => lists.value.filter((l) => l.archived))

  function load() {
    const data = loadData()
    lists.value = data.lists || []
    if (!lists.value.find((l) => l.id === 'inbox')) {
      lists.value.unshift({
        id: 'inbox',
        name: '收件匣',
        color: '#4f46e5',
        archived: false,
        createdAt: new Date().toISOString()
      })
      persist()
    }
  }

  function persist() {
    const data = loadData()
    data.lists = lists.value
    saveData(data)
  }

  function addList(name, color = '#6b7280') {
    lists.value.push({
      id: generateId(),
      name,
      color,
      archived: false,
      createdAt: new Date().toISOString()
    })
    persist()
  }

  function renameList(id, name) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    list.name = name
    persist()
  }

  function deleteList(id) {
    if (id === 'inbox') return
    lists.value = lists.value.filter((l) => l.id !== id)
    useTaskStore().deleteByList(id)
    persist()
  }

  function archiveList(id) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    list.archived = true
    persist()
  }

  function unarchiveList(id) {
    const list = lists.value.find((l) => l.id === id)
    if (!list) return
    list.archived = false
    persist()
  }

  return {
    lists,
    active,
    archived,
    load,
    persist,
    addList,
    renameList,
    deleteList,
    archiveList,
    unarchiveList
  }
})
