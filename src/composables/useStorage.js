import { STORAGE_KEY, migrateSchema, validateSchema, getDefaultData } from '@/utils/storageSchema'

export function useStorage() {
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return getDefaultData()
      const parsed = JSON.parse(raw)
      const migrated = migrateSchema(parsed)
      if (!validateSchema(migrated)) return getDefaultData()
      return migrated
    } catch {
      return getDefaultData()
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('localStorage 寫入失敗，可能已超過容量限制', e)
    }
  }

  return { loadData, saveData }
}
