import { useListStore } from '@/stores/listStore'

export function useList() {
  const store = useListStore()

  function addList(name, color) {
    store.addList(name, color)
  }

  function renameList(id, name) {
    store.renameList(id, name)
  }

  function deleteList(id) {
    store.deleteList(id)
  }

  function archiveList(id) {
    store.archiveList(id)
  }

  function unarchiveList(id) {
    store.unarchiveList(id)
  }

  return { addList, renameList, deleteList, archiveList, unarchiveList }
}
