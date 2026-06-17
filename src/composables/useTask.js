import { useTaskStore } from '@/stores/taskStore'

export function useTask() {
  const store = useTaskStore()

  function addTask(payload) {
    store.addTask(payload)
  }

  function updateTask(id, payload) {
    store.updateTask(id, payload)
  }

  function deleteTask(id) {
    store.deleteTask(id)
  }

  function toggleTask(id) {
    store.toggleTask(id)
  }

  function addSubTask(taskId, title) {
    store.addSubTask(taskId, title)
  }

  function toggleSubTask(taskId, subId) {
    store.toggleSubTask(taskId, subId)
  }

  function deleteSubTask(taskId, subId) {
    store.deleteSubTask(taskId, subId)
  }

  return { addTask, updateTask, deleteTask, toggleTask, addSubTask, toggleSubTask, deleteSubTask }
}
