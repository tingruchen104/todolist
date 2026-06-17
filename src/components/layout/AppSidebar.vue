<template>
  <aside :class="['sidebar', { 'sidebar--open': open }]">
    <div class="sidebar-inner">
      <div class="sidebar-section">
        <div
          v-for="list in listStore.active"
          :key="list.id"
          :class="['list-item', { 'list-item--active': currentListId === list.id }]"
          @click="select(list.id)"
        >
          <span class="list-dot" :style="{ backgroundColor: list.color }" />
          <span class="list-name">{{ list.name }}</span>
          <span class="list-count">{{ taskCount(list.id) }}</span>
        </div>
      </div>

      <div v-if="listStore.archived.length" class="sidebar-section">
        <p class="sidebar-label">已封存</p>
        <div
          v-for="list in listStore.archived"
          :key="list.id"
          :class="['list-item', 'list-item--archived', { 'list-item--active': currentListId === list.id }]"
          @click="select(list.id)"
        >
          <span class="list-dot" :style="{ backgroundColor: list.color }" />
          <span class="list-name">{{ list.name }}</span>
        </div>
      </div>

      <button class="add-list-btn" @click="$emit('add-list')">＋ 新增清單</button>
    </div>
  </aside>
</template>

<script setup>
import { useListStore } from '@/stores/listStore'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  open: { type: Boolean, default: true },
  currentListId: { type: String, default: 'inbox' }
})

const emit = defineEmits(['select-list', 'add-list'])

const listStore = useListStore()
const taskStore = useTaskStore()

function taskCount(listId) {
  return taskStore.byList(listId).filter((t) => !t.completed).length || ''
}

function select(listId) {
  emit('select-list', listId)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface-raised);
  overflow-y: auto;
  transition: transform var(--transition-base);
}

.sidebar-inner { padding: var(--space-md) var(--space-sm); }

.sidebar-section { margin-bottom: var(--space-md); }

.sidebar-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-xs);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.list-item:hover { background-color: var(--color-surface-overlay); }
.list-item--active { background-color: var(--color-surface-overlay); font-weight: 500; }
.list-item--archived { opacity: 0.6; }

.list-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-name { flex: 1; font-size: 14px; color: var(--color-text); }

.list-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 16px;
  text-align: right;
}

.add-list-btn {
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.add-list-btn:hover {
  background-color: var(--color-surface-overlay);
  color: var(--color-text);
}

/* Mobile: 側欄以抽屜方式覆蓋 */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 56px;
    z-index: 50;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }
  .sidebar--open { transform: translateX(0); }
}
</style>
