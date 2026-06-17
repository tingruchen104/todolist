import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import { useNotification } from '@/composables/useNotification'
import { generateId } from '@/utils/idUtils'

export const useTaskStore = defineStore('tasks', () => {
  const { loadData, saveData } = useStorage()
  const { scheduleReminder, cancelReminder } = useNotification()
  const tasks = ref([])

  const byList = computed(() => (listId) => tasks.value.filter((t) => t.listId === listId))
  const incomplete = computed(() => tasks.value.filter((t) => !t.completed))
  const completed = computed(() => tasks.value.filter((t) => t.completed))

  function load() {
    const data = loadData()
    tasks.value = data.tasks || []
    tasks.value.filter((t) => !t.completed && t.dueDate).forEach(scheduleReminder)
  }

  function persist() {
    const data = loadData()
    data.tasks = tasks.value
    saveData(data)
  }

  function addTask(payload) {
    const now = new Date().toISOString()
    const task = {
      id: generateId(),
      listId: payload.listId || 'inbox',
      title: payload.title,
      description: payload.description || '',
      priority: payload.priority || 'medium',
      dueDate: payload.dueDate || null,
      completed: false,
      completedAt: null,
      subTasks: [],
      createdAt: now,
      updatedAt: now
    }
    tasks.value.unshift(task)
    if (task.dueDate) scheduleReminder(task)
    persist()
  }

  function updateTask(id, payload) {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    tasks.value[idx] = { ...tasks.value[idx], ...payload, updatedAt: new Date().toISOString() }
    cancelReminder(id)
    if (tasks.value[idx].dueDate && !tasks.value[idx].completed) scheduleReminder(tasks.value[idx])
    persist()
  }

  function deleteTask(id) {
    cancelReminder(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    persist()
  }

  function toggleTask(id) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    task.completed = !task.completed
    task.completedAt = task.completed ? new Date().toISOString() : null
    task.updatedAt = new Date().toISOString()
    if (task.completed) cancelReminder(id)
    else if (task.dueDate) scheduleReminder(task)
    persist()
  }

  function deleteByList(listId) {
    tasks.value = tasks.value.filter((t) => t.listId !== listId)
    persist()
  }

  function addSubTask(taskId, title) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.subTasks.push({ id: generateId(), title, completed: false })
    task.updatedAt = new Date().toISOString()
    persist()
  }

  function toggleSubTask(taskId, subId) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    const sub = task.subTasks.find((s) => s.id === subId)
    if (!sub) return
    sub.completed = !sub.completed
    task.updatedAt = new Date().toISOString()
    persist()
  }

  function deleteSubTask(taskId, subId) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return
    task.subTasks = task.subTasks.filter((s) => s.id !== subId)
    task.updatedAt = new Date().toISOString()
    persist()
  }

  return {
    tasks,
    byList,
    incomplete,
    completed,
    load,
    persist,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    deleteByList,
    addSubTask,
    toggleSubTask,
    deleteSubTask
  }
})
