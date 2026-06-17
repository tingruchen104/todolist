export const STORAGE_KEY = 'todolist_v1'
export const SCHEMA_VERSION = 1

const DEFAULT_DATA = {
  _version: 1,
  lists: [
    {
      id: 'inbox',
      name: '收件匣',
      color: '#4f46e5',
      archived: false,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: []
}

export function migrateSchema(data) {
  if (!data || !data._version) return { ...DEFAULT_DATA }
  return data
}

export function validateSchema(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.lists) &&
    Array.isArray(data.tasks)
  )
}

export function getDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA))
}
