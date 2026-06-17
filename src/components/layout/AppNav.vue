<template>
  <nav class="app-nav">
    <button
      v-for="list in visibleLists"
      :key="list.id"
      :class="['nav-item', { 'nav-item--active': currentListId === list.id }]"
      @click="$emit('select-list', list.id)"
    >
      <span class="nav-dot" :style="{ backgroundColor: list.color }" />
      <span class="nav-label">{{ list.name }}</span>
    </button>
    <button class="nav-item" @click="$emit('open-all-lists')">
      <span class="nav-icon">☰</span>
      <span class="nav-label">所有清單</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'

const props = defineProps({
  currentListId: { type: String, default: 'inbox' }
})

defineEmits(['select-list', 'open-all-lists'])

const listStore = useListStore()
const visibleLists = computed(() => listStore.active.slice(0, 3))
</script>

<style scoped>
.app-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 20;
  align-items: stretch;
}

@media (max-width: 767px) {
  .app-nav { display: flex; }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.nav-item--active { color: var(--color-primary); }

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.nav-icon { font-size: 16px; }

.nav-label { font-size: 10px; font-weight: 500; }
</style>
