<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" aria-label="切換選單" @click="$emit('toggle-sidebar')">☰</button>
      <span class="header-title">{{ currentListName }}</span>
    </div>
    <div class="header-right">
      <Transition name="search-expand">
        <input
          v-if="searchOpen"
          ref="searchInput"
          v-model="query"
          class="search-input"
          placeholder="搜尋任務…"
          @keydown.escape="closeSearch"
        />
      </Transition>
      <button class="icon-btn" aria-label="搜尋" @click="toggleSearch">🔍</button>
      <button
        class="icon-btn"
        :aria-label="isDark ? '切換淺色模式' : '切換深色模式'"
        @click="toggleDark"
      >{{ isDark ? '☀️' : '🌙' }}</button>
      <button
        v-if="notifSupported && notifPermission !== 'granted'"
        class="icon-btn"
        aria-label="開啟提醒通知"
        title="開啟截止提醒"
        @click="requestPermission"
      >🔔</button>
      <button class="icon-btn" aria-label="匯出資料" title="匯出 JSON 備份" @click="exportJson">💾</button>
      <button class="icon-btn" aria-label="新增任務" @click="$emit('add-task')">＋</button>
    </div>
  </header>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useNotification } from '@/composables/useNotification'
import { useExport } from '@/composables/useExport'

defineProps({
  currentListName: { type: String, default: '收件匣' }
})

const emit = defineEmits(['toggle-sidebar', 'add-task', 'update:search'])

const { isDark, toggle: toggleDark } = useDarkMode()
const { isSupported: notifSupported, permission: notifPermission, requestPermission } = useNotification()
const { exportJson } = useExport()

const searchOpen = ref(false)
const query = ref('')
const searchInput = ref(null)

watch(query, (val) => emit('update:search', val))

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    query.value = ''
  }
}

function closeSearch() {
  searchOpen.value = false
  query.value = ''
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  height: 56px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.header-title { font-size: 16px; font-weight: 600; }

.menu-toggle {
  display: none;
  font-size: 20px;
  color: var(--color-text-secondary);
  padding: var(--space-xs);
}

@media (max-width: 767px) {
  .menu-toggle { display: block; }
}

.icon-btn {
  font-size: 18px;
  color: var(--color-text-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.icon-btn:hover { color: var(--color-text); }

.search-input {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-surface-raised);
  color: var(--color-text);
  width: 200px;
  transition: width var(--transition-base);
}
.search-input:focus { outline: none; border-color: var(--color-primary); }

@media (max-width: 767px) {
  .search-input { width: 140px; }
}

.search-expand-enter-active, .search-expand-leave-active {
  transition: opacity var(--transition-base), width var(--transition-base);
}
.search-expand-enter-from, .search-expand-leave-to { opacity: 0; width: 0; }
</style>
